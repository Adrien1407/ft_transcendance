import { Socket } from "socket.io";
import { Lobby } from "../lobby.service";
import { ServerEvents } from "../enums/server.events";
import { UserInterface } from "src/chat_socket/interface/user.interface";

export type PlayerSocket = Socket & {
	data: {
		lobby: null | Lobby;
		is_spectate: boolean;
		queue: null | 'normal_random' | 'custom_random' | string;
		queue_type: 'normal' | 'custom' | null;
		user: UserInterface,
		elo: number,
		opponent_elo: number | null,
		already_connected: boolean,
	}
}
