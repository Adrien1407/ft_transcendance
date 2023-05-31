export enum ClientEvents {
	track_state = "client.track_state",
	// Send a `message` to a `channel`
	message = "client.message",
	// Create a new `channel`
	create_channel = "client.create_channel",
	// Join a `channel` (potentially using a `password`)
	join_channel = "client.join_channel",
	// Leaves a `channel`
	leave_channel = "client.leave_channel",
	// Block a `user`
	block_user = "client.block_user",
	// Unblock a `user`
	unblock_user = "client.unblock_user",
	// Propose a game
	invite_to_game = "client.invite_to_game",
	// Add to friend
	add_friend = "client.add_friend",

	// Needs to be a chanop
	//  |
	//  v

	// Adds an `user` in a private `channel`
	add_to_channel = "client.add_to_channel",
	// Ban an `user` from a `channel` for `time` second
	ban_from_channel = "client.ban_from_channel",
	// Unban an `user` from a `channel`
	unban_from_channel = "client.unban_from_channel",
	// Mute an `user` in a `channel` for `time` second
	mute_in_channel = "client.mute_in_channel",
	// Mute an `user` in a `channel`
	unmute_in_channel = "client.unmute_in_channel",

	// Needs to be an owner
	//  |
	//  v

	// Changes the visibility of a `channel` (public, password, private). Needs a `password` to go from any mode to password
	// To change password, send message again with the new password
	change_visibility = "client.change_visibility",
	// Changes the name of a `channel`
	change_name = "client.change_name",
	// Set an `user` the role of chanop on a `channel`
	promote = "client.to_chanop",
	// Set an `user` the role of user on a `channel`
	demote = "client.to_user"
}
