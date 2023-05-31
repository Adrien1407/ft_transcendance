import { ChannelStatus } from "src/chat_socket/enum/channel.status";

export class UserIdentity {
	id: number;
	login: string;
	display_name: string;
}

export class ReturnChannel {
	name: string;
	channel_id: number;
	type: ChannelStatus;
	users: UserIdentity[];
}
