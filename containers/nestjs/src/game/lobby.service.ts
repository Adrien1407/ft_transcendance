import { Injectable, Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { BallDto } from "./dto/ball.dto";
import { Start } from "./model/start.model";
import { ServerEvents } from "./enums/server.events";
import { PlayerSocket } from "./model/player-socket.model"
import { PlayerIDs } from "./enums/player-ids.enum";
import { Score } from "src/db/matchs/model/score.model";
import { EloWinStatus } from "src/utils/calculate_elo";
import { MatchOutput } from "./model/match-output.model";

class Player {
	socket: PlayerSocket;
	ready: boolean;
	focused: boolean;
	score: number;
	constructor(socket: PlayerSocket) {
		this.socket = socket;
		this.ready = false;
		this.focused = true;
		this.score = 0;
	}
}

@Injectable()
export class Lobby {
	public p1: Player;
	public p2: Player;
	constructor(public id: string, private server: Server, p1: PlayerSocket, p2: PlayerSocket, private is_custom_mode: boolean)
	{
		this.p1 = new Player(p1);
		this.p2 = new Player(p2);
		this.p1.socket.join(id);
		this.p2.socket.join(id);
		Logger.debug("Created game with ID: " + id);
	}

	addSpectator(spectator: PlayerSocket): {id: string, is_custom: boolean} {
		spectator.join(this.id);
		spectator.data.lobby = this;
		return {id: this.id, is_custom: this.is_custom_mode};
	}

	handleDisconnection(player: PlayerSocket): {p1: Score, p2: Score, output: EloWinStatus} | null {
		Logger.debug("Ended game because disconnection")
		player.leave(this.id)
		if (player == this.p1.socket) {
			this.server.to(this.id).emit(ServerEvents.disconnection, player.data.user.id);
			let p1: Score = {elo: this.p1.socket.data.elo, id: this.p1.socket.data.user.id, score: 0}
			let p2: Score = {elo: this.p2.socket.data.elo, id: this.p2.socket.data.user.id, score: 11}
			// this.p2.socket.disconnect();
			return {p1: p1, p2: p2, output: EloWinStatus.lose}
		} else if (player == this.p2.socket) {
			this.server.to(this.id).emit(ServerEvents.disconnection, player.data.user.id);
			let p1: Score = {elo: this.p1.socket.data.elo, id: this.p1.socket.data.user.id, score: 11}
			let p2: Score = {elo: this.p2.socket.data.elo, id: this.p2.socket.data.user.id, score: 0}
			// this.p1.socket.disconnect();
			return {p1: p1, p2: p2, output: EloWinStatus.win}
		} else {
			return;
		}
	}

	endGame(message: MatchOutput) {
		this.server.to(this.id).emit(ServerEvents.end_game, message);
	}

	send(subject: string, message: any) {
		this.server.to(this.id).emit(subject, message);
	}

	playerReady(player: PlayerSocket) {
		if (player == this.p1.socket) {
			Logger.debug("Player 1 is ready");
			this.p1.ready = true
			player.emit(ServerEvents.connection, 1);
		} else if (player == this.p2.socket) {
			Logger.debug("Player 2 is ready");
			this.p2.ready = true
			player.emit(ServerEvents.connection, 2);
		} else {
			return;
		}
		if (this.p1.ready && this.p2.ready) {
			Logger.debug("Beginning game");
			this.server.to(this.id).emit(ServerEvents.start, {speed: 4, vector_x: -1, score_left: 0, score_right: 0})
		}
	}

	moveRacket(player: PlayerSocket, pos_y: number) {
		if (player == this.p1.socket) {
			player.broadcast.to(this.id).emit(ServerEvents.racket_movement, {pos_y: pos_y, player_id: 1});
		} else if (player == this.p2.socket) {
			player.broadcast.to(this.id).emit(ServerEvents.racket_movement, {pos_y: pos_y, player_id: 2});
		}
	}

	handleCollision(player: PlayerSocket, ball: BallDto) {
		if (player == this.p1.socket || player == this.p2.socket) {
			player.broadcast.to(this.id).emit(ServerEvents.ball_collision, ball);
		}
	}

	handleClientFocus(player: PlayerSocket) {
		if (player == this.p1.socket) {
			this.p1.focused = true;
			this.p2.socket.emit(ServerEvents.focused)
		} else if (player == this.p2.socket) {
			this.p2.focused = true;
			this.p1.socket.emit(ServerEvents.focused)
		}
	}

	handleClientUnfocus(player: PlayerSocket) {
		if (player == this.p1.socket) {
			this.p1.focused = false;
			this.p2.socket.emit(ServerEvents.unfocused)
		} else if (player == this.p2.socket) {
			this.p2.focused = false;
			this.p1.socket.emit(ServerEvents.unfocused)
		}
	}

	passBallData(player: PlayerSocket, ball: BallDto) {
		if (player == this.p1.socket) {
			this.p2.socket.emit(ServerEvents.ball_data, ball)
		} else if (player == this.p2.socket) {
			this.p1.socket.emit(ServerEvents.ball_data, ball)
		}
	}

	endRound(client: PlayerSocket, winner: PlayerIDs.P1 | PlayerIDs.P2): MatchOutput | null {
		if (this.p1.score == 11 || this.p2.score == 11) {
			return null;
		}
		if (winner == PlayerIDs.P1
			&& (client == this.p1.socket
			|| (!this.p1.focused && client == this.p2.socket))) {
			Logger.debug("P2 win");
			this.p2.score++;
		} else if (winner == PlayerIDs.P2
			&& (client == this.p2.socket
			|| (!this.p2.focused && client == this.p1.socket))) {
				Logger.debug("P1 win");
			this.p1.score++;
		} else {
			return null;
		}

		if (this.p1.score == 11) {
			Logger.debug('final victory P1');
			const p1: Score = {score: 11, elo: this.p1.socket.data.elo, id: this.p1.socket.data.user.id};
			const p2: Score = {score: this.p2.score, elo: this.p2.socket.data.elo, id: this.p2.socket.data.user.id};
			return {p1: p1, p2: p2, output: EloWinStatus.win};
		}
		else if (this.p2.score == 11) {
			Logger.debug('final victory P2');
			const p1: Score = {score: this.p1.score, elo: this.p1.socket.data.elo, id: this.p1.socket.data.user.id};
			const p2: Score = {score: 11, elo: this.p2.socket.data.elo, id: this.p2.socket.data.user.id};
			return {p1: p1, p2: p2, output: EloWinStatus.lose};
		}

		let start: Start = {speed: 4, vector_x: 0, score_left: this.p1.score, score_right: this.p2.score};
		if (this.p1.score > this.p2.score) {
			start.vector_x = 1;
		} else {
			start.vector_x = -1;
		}
		this.server.to(this.id).emit(ServerEvents.start, start);
	}

	async destroy() {
		this.server.to(this.id).socketsLeave(this.id);
		let sockets = await this.server.to(this.id).fetchSockets();
		sockets.forEach(sock => {
			sock.data.lobby = null;
		});
	}
}
