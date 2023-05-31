import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { MatchManager } from "./match-manager.service"
import { UsePipes, ValidationPipe, UseFilters, NotFoundException, HttpException, HttpStatus, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { Server, Socket } from "socket.io"
import { Logger, UseGuards } from "@nestjs/common";
import { JWTGuard, JWTOtpGuard } from "src/auth/guards/jwt.guard";
import { PlayerSocket } from "./model/player-socket.model";
import { ClientEvents } from "./enums/client.events";
import { RacketDto } from "./dto/racket.dto";
import { BallDto } from "./dto/ball.dto";
import { PlayerIDs } from "./enums/player-ids.enum";
import { UUIDWrapper } from "./dto/uuid-wrapper.dto";
import { WsDtoFilter } from "src/chat_socket/filter/WsDtoFilter.filter";
import { getJwtContentFromSocket } from "src/utils/get_jwt_content";
import { UserService } from "src/db/user/services/user.service";
import { MatchService } from "src/db/matchs/service/match.service";
import { Score } from "src/db/matchs/model/score.model";
import { calculateElo, EloWinStatus } from "src/utils/calculate_elo";
import { MatchOutput } from "./model/match-output.model";
import { UserStatus } from "src/chat_socket/enum/user.status";
import { ServerEvents } from "./enums/server.events";
import { ChatGateway } from "src/chat_socket/service/chat.gateway";

@WebSocketGateway({
	namespace: 'game',
	cors: true
})
@UsePipes(new ValidationPipe())
@UseFilters(new WsDtoFilter())
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private server: Server;
	private match_manager: MatchManager;
	private userSet: Set<number>;

	constructor(
		private userService: UserService,
		private matchService: MatchService,
		private chatGateway: ChatGateway
	) {}

	afterInit() {
		this.match_manager = new MatchManager(this.server, this.userService);
		this.userSet = new Set<number>();
	}


	@UseGuards(JWTOtpGuard)
	async handleConnection(@ConnectedSocket() client: PlayerSocket) {
		Logger.debug("Client connected to Game socket")
		let user = getJwtContentFromSocket(client);
		if (!user) {
			client.disconnect()
			return;
		}
		client.data.user = user;
		let data_user = await this.userService.getUserById(user.id);
		if (!data_user) {
			client.disconnect();
			return;
		}
		if (this.userSet.has(client.data.user.id)) {
			Logger.debug("Disconnecting user from game socket: Already connected");
			client.send(ServerEvents.already_connected);
			client.data.already_connected = true;
			client.disconnect()
			return;
		}
		this.userSet.add(client.data.user.id);
		client.data.already_connected = false;
		client.data.elo = data_user.elo;
	}

	async archiveGame(p1: PlayerSocket, p2: PlayerSocket, result: MatchOutput) {
		let result_elo = calculateElo(result.p1.elo, result.p2.elo, result.output);
		result.p1.elo = result_elo.p1_elo;
		result.p2.elo = result_elo.p2_elo;

		p1.data.elo = result.p1.elo;
		p2.data.elo = result.p2.elo;

		await this.matchService.archiveMatch(result.p1, result.p2);
	}

	handleDisconnect(@ConnectedSocket() client: PlayerSocket) {
		Logger.debug("Client disconnected to Game socket")
		if (client.data.already_connected) {
			return;
		}
		this.userSet.delete(client.data.user.id);
		if (client.data.user && client.data.user.id >= 1) {
			this.userService.updateUser(client.data.user.id, {current_game: null})
			this.changeUserStatusIfOnline(client);
		}

		if (client.data.lobby) {
			this.handleLeaveGame(client)
		} else {
			this.handleLeaveQueue(client)
		}
	}

	@SubscribeMessage(ClientEvents.precise_game)
	async handlePreciseGame(@ConnectedSocket() client: PlayerSocket, @MessageBody() game_id: UUIDWrapper): Promise<{id: string, is_custom: boolean} | null> {
		Logger.log("precise game");
		await this.changeUserStatus(client, UserStatus.waiting_for_game)
		let ret_val = await this.match_manager.addPlayerToNormalPrivateQueue(client, game_id.uuid);
		if (ret_val) {
			await this.chatGateway.changeState(client.data.user.login, UserStatus.in_game, ret_val.id);
			return ret_val
		}
		let id = parseInt(game_id.uuid, 10)
		if (id) {
			let user = await this.userService.getUserById(client.data.user.id);
			this.chatGateway.sendGameInvitationMessage(user.displayName + " joined the normal queue.", id);
		}
		return null
	}

	@SubscribeMessage(ClientEvents.random_game)
	async handleRandomGame(@ConnectedSocket() client: PlayerSocket) {
		await this.changeUserStatus(client, UserStatus.waiting_for_game)
		let id = await this.match_manager.addPlayerToNormalRandomQueue(client as PlayerSocket);
		if (id) {
			await this.chatGateway.changeState(client.data.user.login, UserStatus.in_game, id);
		}
	}

	@SubscribeMessage(ClientEvents.custom_precise_game)
	async handleCustomPreciseGame(@ConnectedSocket() client: PlayerSocket, @MessageBody() game_id: UUIDWrapper): Promise<{id: string, is_custom: boolean} | null> {
		Logger.log("precise game");
		await this.changeUserStatus(client, UserStatus.waiting_for_game)
		let ret_val = await this.match_manager.addPlayerToCustomPrivateQueue(client, game_id.uuid);
		if (ret_val) {
			await this.chatGateway.changeState(client.data.user.login, UserStatus.in_game, ret_val.id);
			return ret_val
		}
		let id = parseInt(game_id.uuid, 10)
		if (id) {
			let user = await this.userService.getUserById(client.data.user.id);
			this.chatGateway.sendGameInvitationMessage(user.displayName + " joined the custom queue.", id);
		}
		return null
	}

	@SubscribeMessage(ClientEvents.custom_random_game)
	async handleCustomRandomGame(@ConnectedSocket() client: PlayerSocket) {
		await this.changeUserStatus(client, UserStatus.waiting_for_game)
		let id = await this.match_manager.addPlayerToCustomRandomQueue(client as PlayerSocket);
		if (id) {
			await this.chatGateway.changeState(client.data.user.login, UserStatus.in_game, id);
		}
	}

	async changeUserStatus(client: PlayerSocket, status: UserStatus, current_game?: string) {
		await this.userService.changeUserStatus(client.data.user.id, status, current_game)
		this.chatGateway.changeState(client.data.user.login, status);
	}

	async changeUserStatusIfOnline(client: PlayerSocket) {
		if (await this.userService.changeUserStatusIfOnline(client.data.user.id, UserStatus.online) > 0) {
			this.chatGateway.changeState(client.data.user.login, UserStatus.online);
		}
	}

	// #region messages
	@SubscribeMessage(ClientEvents.ready)
	handlePlayerReady(@ConnectedSocket() client: PlayerSocket) {
		Logger.log("handlePlayerReady")
		if (!client.data.lobby) {
			throw new BadRequestException('Not in game.');
		}
		this.changeUserStatus(client, UserStatus.in_game)
		this.userService.updateUser(client.data.user.id, {current_game: client.data.lobby.id})
		client.data.lobby.playerReady(client)
	}

	@SubscribeMessage(ClientEvents.racket_movement)
	handleRacketMovement(@ConnectedSocket() client: PlayerSocket, @MessageBody() racket: RacketDto) {
		if (client.data.lobby) {
			client.data.lobby.moveRacket(client, racket.position_y);
		}
	}

	@SubscribeMessage(ClientEvents.ball_collision)
	handleCollision(@ConnectedSocket() client: PlayerSocket, @MessageBody() ball: BallDto) {
		if (client.data.lobby) {
			client.data.lobby.handleCollision(client, ball);
		}
	}

	@SubscribeMessage(ClientEvents.ball_data) // When an unfocused player re-focus
	handleBallData(@ConnectedSocket() client: PlayerSocket, @MessageBody() ball: BallDto) {
		if (client.data.lobby) {
			client.data.lobby.handleCollision(client, ball);
		}
	}

	@SubscribeMessage(ClientEvents.focus)
	handleClientFocus(@ConnectedSocket() client: PlayerSocket) {
		if (client.data.lobby) {
			client.data.lobby.handleClientFocus(client);
		}
	}

	@SubscribeMessage(ClientEvents.leave_queue)
	handleLeaveQueue(@ConnectedSocket() client: PlayerSocket) {
		Logger.log("leaveQueue");
		this.changeUserStatusIfOnline(client);
		if (client.data.queue_type == 'normal' && client.data.queue == 'random') {
			Logger.log("normal random");
			this.match_manager.removePlayerFromNormalRandomQueue(client);
		} else if (client.data.queue_type == 'custom' && client.data.queue == 'random') {
			Logger.log("custom random");
			this.match_manager.removePlayerFromCustomRandomQueue(client);
		} else if (client.data.queue_type == 'normal' && client.data.queue) {
			Logger.log("normal private");
			this.match_manager.removePlayerFromNormalPrivateQueue(client, client.data.queue);
		} else if (client.data.queue_type == 'custom' && client.data.queue) {
			Logger.log("custom private");
			this.match_manager.removePlayerFromCustomPrivateQueue(client, client.data.queue);
		}
	}

	@SubscribeMessage(ClientEvents.leave_game)
	handleLeaveGame(@ConnectedSocket() client: PlayerSocket) {
		Logger.log('Leave Game')
		if (client.data.lobby) {
			Logger.log('Was in game')
			client.data.lobby.handleDisconnection(client);
			if (!client.data.is_spectate) {
				Logger.log('Was a player')
				let lobby_id = client.data.lobby.id;
				let p1 = client.data.lobby.p1.socket;
				let p2 = client.data.lobby.p2.socket;
				client.data.lobby.destroy();
				this.match_manager.removeLobby(lobby_id);
				this.changeUserStatus(p1, UserStatus.online)
				this.changeUserStatus(p2, UserStatus.online)
			}
		}
	}

	@SubscribeMessage(ClientEvents.unfocus)
	handleClientUnfocus(@ConnectedSocket() client: PlayerSocket) {
		if (client.data.lobby) {
			client.data.lobby.handleClientUnfocus(client);
		}
	}

	@SubscribeMessage(ClientEvents.end_of_round)
	async handleEndRound(@ConnectedSocket() client: PlayerSocket, @MessageBody() winner: PlayerIDs.P1 | PlayerIDs.P2) {
		if (!client.data.lobby) {
			throw new BadRequestException('Not in game')
		}
		const result = client.data.lobby.endRound(client, winner);
		if (result) {
			Logger.log(JSON.stringify(result));

			let p1 = client.data.lobby.p1.socket;
			let p2 = client.data.lobby.p2.socket;
			this.changeUserStatus(p1, UserStatus.online)
			this.changeUserStatus(p2, UserStatus.online)
			let lobby_id = client.data.lobby.id;
			client.data.lobby.endGame(result);
			client.data.lobby.destroy();
			this.match_manager.removeLobby(lobby_id);
			await this.archiveGame(p1, p2, result)
		}
	}
	// #endregion messages
}
