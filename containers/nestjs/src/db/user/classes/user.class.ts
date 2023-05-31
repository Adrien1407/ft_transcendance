import { UserStatus } from "src/chat_socket/enum/user.status";

export class ReturnUser {
	id: number;
	login: string;
	displayName: string;
	picture: string;
	state: UserStatus;
	otp_state: boolean;
	otp_secret?: string;
	otp_verified?: boolean;
	last_disconnection_time: Date;
	last_connection_time: Date;
	elo: number;
	current_game?: string;
}

export class ReturnProfile {
	id: number;
	login: string;
	displayName: string;
	picture: string;
	state: UserStatus;
	current_game?: string;
}
