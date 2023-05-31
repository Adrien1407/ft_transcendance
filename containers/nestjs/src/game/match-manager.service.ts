import { Injectable, Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { UserService } from "src/db/user/services/user.service";
import { inspect } from "util";
import { ServerEvents } from "./enums/server.events";
import { Lobby } from "./lobby.service"
import { PlayerSocket } from "./model/player-socket.model";


export enum TypeOfJoin {
	spectator,
	joined_queue,
	playing
}

@Injectable()
export class MatchManager {
	private games_playing: Map<Lobby['id'], Lobby> = new Map<Lobby['id'], Lobby>();
	private normal_random_queue: PlayerSocket[] = [];
	private normal_private_queues: Map<Lobby['id'], PlayerSocket[]> = new Map<Lobby['id'], PlayerSocket[]>();
	private custom_random_queue: PlayerSocket[] = [];
	private custom_private_queues: Map<Lobby['id'], PlayerSocket[]> = new Map<Lobby['id'], PlayerSocket[]>();

	constructor(private server: Server, private userService: UserService) {};

	async createNewGame(p1: PlayerSocket, p2: PlayerSocket, uuid=crypto.randomUUID(), is_custom_mode=false): Promise<string> {
		Logger.debug("Creating a new game");
		p1.data.queue_type = null;
		p1.data.queue = null;
		p2.data.queue_type = null;
		p2.data.queue = null;

		p1.data.opponent_elo = p2.data.elo;
		p2.data.opponent_elo = p1.data.elo;

		p1.data.is_spectate = false;
		p2.data.is_spectate = false;

		if (parseInt(uuid)) {
			uuid = (is_custom_mode ? "custom" : "normal") + uuid
		}

		await this.userService.setGame(p1.data.user.id, p2.data.user.id, uuid);

		p1.emit(ServerEvents.server_id, uuid);
		p1.emit(ServerEvents.opponent_elo, p1.data.opponent_elo)
		p2.emit(ServerEvents.server_id, uuid);
		p2.emit(ServerEvents.opponent_elo, p2.data.opponent_elo)

		let new_lobby = new Lobby(uuid, this.server, p1, p2, is_custom_mode);
		this.games_playing.set(uuid, new_lobby);
		p1.data.lobby = new_lobby;
		p2.data.lobby = new_lobby;
		return uuid;
	}

	initializeSocket(player: PlayerSocket) {
		player.data.lobby = null;
		player.data.queue = null;
		player.data.is_spectate = true;
	}


	async addPlayerToNormalRandomQueue(player: PlayerSocket): Promise<string | null> {
		Logger.debug("Added player to queue");
		this.initializeSocket(player);
		player.data.queue = 'random'
		this.normal_random_queue.push(player);
		if (this.normal_random_queue.length >= 2) {
			return await this.createNewGame(this.normal_random_queue.shift(), this.normal_random_queue.shift());
		} else {
			player.data.queue_type = 'normal';
			player.data.queue = 'random'
		}
	}

	async addPlayerToNormalPrivateQueue(player: PlayerSocket, uuid: string): Promise<{id: string, is_custom: boolean} | null> {
		Logger.log("addPlayerToNormalPrivateQueue(" + player.data.user.login + ", " + uuid + ");")
		this.initializeSocket(player)

		let game_playing = this.games_playing.get("normal" + uuid);
		if (game_playing) {
			return game_playing.addSpectator(player);
		}

		let queue: PlayerSocket[] | undefined = this.normal_private_queues.get(uuid);
		Logger.log(inspect(queue));
		if (!queue || queue.length == 0) {
			player.data.queue_type = 'normal';
			player.data.queue = uuid;
			this.normal_private_queues.set(uuid, [player]);
		} else {
			return {id: await this.createNewGame(queue.shift(), player, "normal" + uuid), is_custom: false};
		}
		return null;
	}

	async addPlayerToCustomRandomQueue(player: PlayerSocket): Promise<string | null> {
		this.initializeSocket(player);
		this.custom_random_queue.push(player);
		if (this.custom_random_queue.length >= 2) {
			return await this.createNewGame(this.custom_random_queue.shift(), this.custom_random_queue.shift(), crypto.randomUUID(), false);
		} else {
			player.data.queue_type = 'custom';
			player.data.queue = 'random';
		}
	}

	async addPlayerToCustomPrivateQueue(player: PlayerSocket, uuid: string): Promise<{id: string, is_custom: boolean} | null> {
		this.initializeSocket(player)

		let game_playing = this.games_playing.get("custom" + uuid);
		if (game_playing) {
			return game_playing.addSpectator(player);
		}

		let queue: PlayerSocket[] | undefined = this.custom_private_queues.get(uuid);
		if (!queue || queue.length == 0) {
			player.data.queue_type = 'custom'
			player.data.queue = uuid;
			this.custom_private_queues.set(uuid, [player]);
		} else {
			return {id: await this.createNewGame(queue.shift(), player, "custom" + uuid), is_custom: true};
		}
		return null;
	}

	removePlayerFromNormalRandomQueue(player: PlayerSocket) {
		let index = this.normal_random_queue.indexOf(player);

		if (index == -1) {
			return;
		}

		this.normal_random_queue.splice(index, 1);
	}

	removePlayerFromNormalPrivateQueue(player: PlayerSocket, uuid: string) {
		let queue = this.normal_private_queues.get(uuid);

		if (!queue) {
			return;
		}

		let index = queue.indexOf(player);

		if (index == -1) {
			return;
		}

		queue.splice(index, 1);
	}

	removePlayerFromCustomRandomQueue(player: PlayerSocket) {
		let index = this.custom_random_queue.indexOf(player);

		if (index == -1) {
			return;
		}

		this.custom_random_queue.splice(index, 1);
	}

	removePlayerFromCustomPrivateQueue(player: PlayerSocket, uuid: string) {
		let queue = this.custom_private_queues.get(uuid);

		if (!queue) {
			return;
		}

		let index = queue.indexOf(player);

		if (index == -1) {
			return;
		}

		queue.splice(index, 1);
	}

	removeLobby(id: string) {
		this.games_playing.delete(id);
	}
}
