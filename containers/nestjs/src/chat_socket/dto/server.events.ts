export interface ServerMessage {
	sender_id: number;
	sender_display_name: string;
	sender_picture_link: string;
	sender_login: string;
	timestamp: Date;
	content: string;
	room: number;
}

export interface ServerInvite {
	sender_id: number;
	sender_display_name: string;
	queue_uuid: string;
	room: number;
}

export interface ServerLeaveChannel {
	leaving_id: number;
	leaving_display_name: string;
	room: number;
}

export interface ServerBannedFromChannel {
	// Person who was kicked
	kicked_id: number;
	kicked_display_name: string;
	// Person who kicked
	chanop_id: number;
	chanop_display_name: string;
	//
	reason: string | null;
	room: number;
	// Number of minutes
	time: number;
}

export interface ServerMuteInChannel {
	// Person who was muted
	muted_id: number;
	muted_display_name: string;
	// Person who muted
	chanop_id: number;
	chanop_display_name: string;
	//
	reason: string | null;
	room: number;
	// Number of minutes
	time: number;
}

export interface ServerPromotionInChannel {
	promoter_id: number;
	promoter_display_name: string;
	chanop_id: number;
	chanop_display_name: string;
	room: number;
}

export interface ServerJoinChannel {
	joiner_id: number;
	joiner_display_name: string;
	room: number;
}

export interface ServerAddToChannel {
	// Person who was added
	added_id: number;
	added_display_name: string;
	// Person who added
	chanop_id: number;
	chanop_display_name: string;
	room: number;
}
