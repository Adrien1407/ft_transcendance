export enum ServerEvents {
	already_connected = 'server.already_connected',
	disconnection = "server.disconnection",
	connection = "server.player_id",
	start = "server.start",
	racket_movement = "server.racket_movement",
	ball_collision = "server.collision",
	unfocused = "server.opponent_unfocused",
	focused = "server.opponent_focused",
	ball_data = "server.ball_data",
	server_id = "server.server_id",
	opponent_elo = 'server.opponent_elo',
	end_game = 'server.end_game'
}
