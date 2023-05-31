export enum ClientEvents {

	// Used to send the new position of the racket
	racket_movement = "client.racket_position",

	// Used when the ball collide with the player
	ball_collision = "client.collision",

	// Used when the ball hits a racket
	end_of_round = "client.end_of_round",

	// Used when the client unfocuses the game
	unfocus = "client.unfocus",

	// Used when the client refocuses the game
	focus = "client.focus",

	// Used to send the ball data to a refocusing player
	ball_data = "client.ball_data",

	// Used to tell the server we're ready to start
	ready = "client.ready",

	// Used to join a precise game
	precise_game = "client.precise_game",

	// Used to join a random game
	random_game = "client.random_game",

	// Used to join a precise game
	custom_precise_game = "client.custom_precise_game",

	// Used to join a random game
	custom_random_game = "client.custom_random_game",

	// Used to leave the queue
	leave_queue = "client.leave_queue",
	// Used to leave the game
	leave_game = "client.leave_game",
}
