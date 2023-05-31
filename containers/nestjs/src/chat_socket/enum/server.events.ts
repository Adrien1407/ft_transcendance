// Uses interfaces found at ../dto/server.events.ts

export enum ServerEvents {
	track_state = "server.track_state",
	// Used to relay a message (ServerMessage)
	message = "server.message",

	// Used to relay a game invitation (ServerMessage)
	invite = "server.invite",

	// Used to pass the list of the IDs of the user (passing a number[])
	blocklist = "server.blocklist",

	// Used to inform that a user has left a channel (ServerLeaveChannel)
	left_channel = "left_channel",

	// Used to inform that a user was banned of a channel (ServerBannedFromChannel)
	banned_from_channel = "ban_channel",

	// Used to inform that a user was muted of a channel (ServerMuteInChannel)
	mute_in_channel = "mute_channel",

	// Used to inform that a user was promoted in a channel (ServerPromotionInChannel)
	promotion_in_channel = "promotion_channel",

	// Used to inform that a user joined a channel (ServerJoinChannel)
	join_channel = "join_channel",

	// Used to inform that a user added another user to a channel (ServerAddToChannel)
	added_channel = "added_channel",

	// Used to inform that a user added another user to a channel (ServerAddToChannel)
	channel_game = "server.channel_game",
}
