import { ChannelStatus } from "src/chat_socket/enum/channel.status";
import { ReturnProfile } from "src/db/user/classes/user.class";

export class ReturnMessage {
	content: string;
	user_id: number;
	user_login: string;
	user_display_name: string;
	user_picture: string;
	channel_id: number;
	is_pong_invite: boolean;
	game_id: string | null;
	created_at: Date;
}

export class ReturnChannel {
	id: number;
	name: string | null;
	type: ChannelStatus;
	owner_id: number | null;
}

export class ReturnChannel2 {
	id: number;
	name: string | null;
	type: ChannelStatus;
	owner: ReturnProfile | null;
	users: ReturnProfile[];
}
