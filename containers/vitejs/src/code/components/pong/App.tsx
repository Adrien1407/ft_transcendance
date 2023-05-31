import React from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense
import { Socket } from "socket.io-client";
import * as utils from '../../utils/utils'
import { type } from "os";

interface ComponentProps {
	size_x: number;
	size_y: number;
	socket: Socket;
	in_queue: React.Dispatch<React.SetStateAction<boolean>>;
	in_game: React.Dispatch<React.SetStateAction<boolean>>;
	custom_mode: boolean;
}

const Pong = React.memo((p: ComponentProps) => {
	type Ball = {
		x: number,
		y: number,
		vector_x: number,
		vector_y: number,
		speed: number,
		reached_maximum: boolean,
		going_left: boolean,
	}

	type Racket = {
		x: number,
		y: number,
		size: number;
		color: string,
		score: number
	}

	const CANVAS_SIZE_X = p.size_x;
	const CANVAS_SIZE_Y = p.size_y;

	const RATIO_X = CANVAS_SIZE_X / 500;
	const RATIO_Y = CANVAS_SIZE_Y / 500;

	const TRANSMISSION_RATIO_X = 500 / CANVAS_SIZE_X;
	const TRANSMISSION_RATIO_Y = 500 / CANVAS_SIZE_Y;

	const MOVE_DISTANCE = 10 * RATIO_Y;

	const RACKET_SIZE_X = 10 * RATIO_X;
	const RACKET_SIZE_Y = 50 * RATIO_Y;
	const DEMI_RACKET_SIZE_Y = RACKET_SIZE_Y / 2;

	const BALL_SIZE = 10 * RATIO_Y;


	const START_POSITION_Y = CANVAS_SIZE_Y / 2 - DEMI_RACKET_SIZE_Y

	const BALL_SPEED_AUGMENTATION = 1.2
	const BALL_MAX_SPEED = 30
	const MAX_BOUNCE_ANGLE = 60
	const MAX_BOUNCE_ANGLE_RADIANS = MAX_BOUNCE_ANGLE * Math.PI / 180

	enum ColorTypes {
		blue = "#63c9ff",
		red = "#db5858",
		gray = "#d0d0d0"
	}
	enum PlayerIDs {
		P1 = 1,
			P2 = 2,
			Spectator = 3
	}

	enum ClientEvents {

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

		leave_queue = "client.leave_queue",
	}


	enum ServerEvents {
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
	type Score = {
		id: number;
		past_elo: number;
		new_elo: number;
		score: number;
	}
	enum EloWinStatus {
		lose = 0,
		win = 1,
	}

		type MatchOutput = {
			p1: Score;
			p2: Score;
			output: EloWinStatus;
		}

		let player_id = 0;
		let is_opponent_unfocused = false;
		const var_socket = p.socket
		let going_down = false;
		let going_up = false;
		let speed_modificator = 1;
		//const var_socket = io(`${import.meta.env.VITE_BACK_URL}/game`, {
		//query      : { jwt: utils.getTokenizedJwtFromCooke()},
		//transports : ['websocket']
		//});

		let left_racket: Racket = {x: 0, y: START_POSITION_Y, color: "#ffffff", score: 0, size: RACKET_SIZE_Y};
		let right_racket: Racket = {x: CANVAS_SIZE_X - RACKET_SIZE_X, y: START_POSITION_Y, color: "#ffffff", score: 0, size: RACKET_SIZE_Y};
		let ball: Ball = {x: CANVAS_SIZE_X / 2, y: CANVAS_SIZE_Y / 2, vector_x: 0, vector_y: 0, speed: 0, reached_maximum: false, going_left: true}

		//region Websocket

		/* Changes the opponent's position */
		const moveOpponentRacket = (message: {pos_y: number, player_id: number}) => {
			if (message.player_id == 1) {
				left_racket.y = message.pos_y * RATIO_Y;
			} else if (message.player_id == 2) {
				right_racket.y = message.pos_y * RATIO_Y;
			}
		}

		const startGame = (message: {speed: number, vector_x: number, score_left: number, score_right: number}) => {
			window.addEventListener('keydown', keydown_handler)
			window.addEventListener('keyup', keyup_handler)
			if (p.custom_mode) {
				const diff = message.score_left - message.score_right
				if (diff > 0) {
					left_racket.size = RACKET_SIZE_Y * Math.pow(0.9, diff)
					right_racket.size = RACKET_SIZE_Y * Math.pow(1.2, diff)
				} else if (diff < 0) {
					left_racket.size = RACKET_SIZE_Y * Math.pow(1.2, -diff)
					right_racket.size = RACKET_SIZE_Y * Math.pow(0.9, -diff)
				} else {
					left_racket.size = RACKET_SIZE_Y;
					right_racket.size = RACKET_SIZE_Y;
				}
			}
			left_racket.y = CANVAS_SIZE_Y / 2 - left_racket.size / 2
			right_racket.y = CANVAS_SIZE_Y / 2 - right_racket.size / 2
			left_racket.score = message.score_left
			right_racket.score = message.score_right
			ball.x = CANVAS_SIZE_X / 2
			ball.y = CANVAS_SIZE_Y / 2
			ball.speed = message.speed
			ball.vector_x = message.vector_x * ball.speed * RATIO_X
			ball.vector_y = 0
			ball.going_left = ball.vector_x < 0;
			ball.reached_maximum = false;

			if (document.hidden) {
				if (import.meta.env.VITE_MONITOR_PONG_FOCUS === "true")
					var_socket.emit(ClientEvents.unfocus);
			}
		}

		const onPlayerID = (id: number) => {
			player_id = id;
			if (player_id == 1) {
				left_racket.color = ColorTypes.blue
				right_racket.color = ColorTypes.red
			} else if (player_id == 2) {
				right_racket.color = ColorTypes.blue
				left_racket.color = ColorTypes.red
			}
		}

		const normalizeBall = (ball: Ball) => {
			const new_ball: Ball = {
				x: ball.x * TRANSMISSION_RATIO_X,
				y: ball.y * TRANSMISSION_RATIO_Y,
				vector_x: ball.vector_x * TRANSMISSION_RATIO_X,
				vector_y: ball.vector_y * TRANSMISSION_RATIO_Y,
				speed: ball.speed,
				reached_maximum: ball.reached_maximum,
				going_left: ball.going_left
			}
			return new_ball
		}
		const serverBallToGameBall = (ball: Ball) => {
			const new_ball: Ball = {
				x: ball.x * RATIO_X,
				y: ball.y * RATIO_Y,
				vector_x: ball.vector_x * RATIO_X,
				vector_y: ball.vector_y * RATIO_Y,
				speed: ball.speed,
				reached_maximum: ball.reached_maximum,
				going_left: ball.going_left
			}
			return new_ball
		}

		// Send the data of the ball when opponent focuses
		const onOpponentFocus = () => {
			var_socket.emit(ClientEvents.ball_data, normalizeBall(ball))
			is_opponent_unfocused = false;
			if (player_id == 1) {
				right_racket.color = ColorTypes.red;
			} else if (player_id == 2) {
				left_racket.color = ColorTypes.red;
			}
		}

		// Called when an opponent disconnects
		// If use is a spectator, player_id identifies the player that disconnected
		const onOpponentDisconnect = (player_id: number) => {
			stopGame()
		}

		var_socket.on(ServerEvents.racket_movement, moveOpponentRacket)
		var_socket.on(ServerEvents.start, startGame)
		var_socket.on(ServerEvents.connection, onPlayerID)
		var_socket.on(ServerEvents.ball_collision, (server_ball: Ball) => {
			ball = serverBallToGameBall(server_ball)
		})
		var_socket.on(ServerEvents.server_id, (id: string) => {
			p.in_game(true)
			var_socket.emit(ClientEvents.ready)
		})
		var_socket.on(ServerEvents.focused, onOpponentFocus);
		var_socket.on(ServerEvents.unfocused, () => {
			is_opponent_unfocused = true;
			if (player_id == 1) {
				right_racket.color = ColorTypes.gray;
			} else if (player_id == 2) {
				left_racket.color = ColorTypes.gray;
			}
		})
		var_socket.on(ServerEvents.ball_data, (received_ball: Ball) => {ball = received_ball})
		var_socket.on(ServerEvents.disconnection, onOpponentDisconnect)
		//endregion

		const isCollisionWithRacket = (racket: Racket) => {
			return (racket.y + racket.size > ball.y && ball.y > racket.y);
		}

		function augmentBallSpeed(is_smash: boolean){
			if (!ball.reached_maximum) {
				const tmp_speed = ball.speed * BALL_SPEED_AUGMENTATION * (is_smash ? 1.6 : 1)
				if (tmp_speed < BALL_MAX_SPEED) {
					ball.speed = tmp_speed
				} else {
					ball.reached_maximum = true
				}
			}
		}

		const ballBounceRacket = (racket: Racket) => {
			let tmp_vector_y = (racket.y + (racket.size / 2)) - ball.y
			tmp_vector_y = (tmp_vector_y / (racket.size / 2))
			tmp_vector_y = tmp_vector_y * MAX_BOUNCE_ANGLE_RADIANS

			const sign = ball.vector_x < 0 ? 1 : -1

			ball.vector_x = (sign * Math.abs(Math.cos(tmp_vector_y))) * ball.speed * RATIO_X
			ball.vector_y = (-Math.sin(tmp_vector_y)) * ball.speed * RATIO_Y

			ball.going_left = ball.vector_x < 0;
			ball.x = Math.max(0, ball.x)
			ball.y = Math.max(0, ball.y)
			ball.x = Math.min(CANVAS_SIZE_X, ball.x)
			ball.y = Math.min(CANVAS_SIZE_Y, ball.y)
			var_socket.emit(ClientEvents.ball_collision, normalizeBall(ball))
		}

		function isSmash(racket: Racket, opponent: Racket): boolean {
			if (!p.custom_mode || racket.score >= opponent.score) {
				return false
			}
			const racket_center = left_racket.y + left_racket.size / 2;
			const is_in_vicinity = racket_center - 2 <= ball.y && ball.y <= racket_center + 2
			return is_in_vicinity
		}

		const advanceBall = () => {
			if (
				(is_opponent_unfocused || player_id == 1)
			&& ball.vector_x < 0
			&& ball.x - BALL_SIZE / 2 < RACKET_SIZE_X
			&& isCollisionWithRacket(left_racket)
			) {
				augmentBallSpeed(isSmash(left_racket, right_racket))
				ballBounceRacket(left_racket)
			} else if (
				(is_opponent_unfocused || player_id == 2)
			&& ball.vector_x >= 0
			&& ball.x + BALL_SIZE / 2  > CANVAS_SIZE_X - RACKET_SIZE_X
			&& isCollisionWithRacket(right_racket)
			) {
				augmentBallSpeed(isSmash(right_racket, left_racket))
				ballBounceRacket(right_racket)
			} else if ((is_opponent_unfocused || player_id == 1) && ball.x < 0) {
				var_socket.emit(ClientEvents.end_of_round, PlayerIDs.P1);
			} else if ((is_opponent_unfocused || player_id == 2) && ball.x > CANVAS_SIZE_X) {
				var_socket.emit(ClientEvents.end_of_round, PlayerIDs.P2);
			}
			if (ball.y < 0 || ball.y > CANVAS_SIZE_Y) {
				ball.vector_y = -ball.vector_y
			}

			ball.x += ball.vector_x;// * ball.speed;
			ball.y += ball.vector_y;// * ball.speed;
		}

		//See annotations in JS for more information
		const setup = (p5: p5Types, canvasParentRef: Element) => {
			p5.createCanvas(CANVAS_SIZE_X, CANVAS_SIZE_Y).parent(canvasParentRef);
			p5.textSize(30 * RATIO_X);
			p5.frameRate(30)
		};

		const draw = (p5: p5Types) => {
			handleMove()
			p5.background(0);
			let left = p5.color(left_racket.color);
			let right = p5.color(right_racket.color);
			p5.fill(left);
			p5.text(left_racket.score, CANVAS_SIZE_X / 2 - 80 * RATIO_X, 50 * RATIO_Y);
			if (!ball.going_left)
				p5.ellipse(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
			p5.rect(left_racket.x, left_racket.y, RACKET_SIZE_X, left_racket.size)
			p5.fill(right);
			p5.text(right_racket.score, CANVAS_SIZE_X / 2 + 50 * RATIO_X, 50 * RATIO_Y);
			if (ball.going_left)
				p5.ellipse(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
			p5.rect(right_racket.x, right_racket.y, RACKET_SIZE_X, right_racket.size)
			advanceBall();
		};

		function handleMove() {
			let modifier: number = 0;
			if (going_down == going_up) {
				return
			}
			else if (going_down) {
				modifier = MOVE_DISTANCE * speed_modificator;
			} else if (going_up) {
				modifier = -MOVE_DISTANCE * speed_modificator;
			}
			if (player_id == 1) {
				if (left_racket.y + modifier < 0) {
					left_racket.y = 0;
				} else if (modifier + left_racket.y > CANVAS_SIZE_Y - left_racket.size) {
					left_racket.y = CANVAS_SIZE_Y - left_racket.size;
				} else {
					left_racket.y += modifier;
				}
				var_socket.emit(ClientEvents.racket_movement, {position_y: left_racket.y * TRANSMISSION_RATIO_Y})
			} else if (player_id == 2) {
				if (right_racket.y + modifier < 0) {
					right_racket.y = 0;
				} else if (modifier + right_racket.y > CANVAS_SIZE_Y - right_racket.size) {
					right_racket.y = CANVAS_SIZE_Y - right_racket.size;
				} else {
					right_racket.y += modifier;
				}
				var_socket.emit(ClientEvents.racket_movement, {position_y: right_racket.y * TRANSMISSION_RATIO_Y})
			}
		}

		const handleFocus = () => {
			if (document.hidden) {
				var_socket.emit(ClientEvents.unfocus);
			} else {
				var_socket.emit(ClientEvents.focus);
			}
		}

		document.addEventListener('visibilitychange', handleFocus)
		document.addEventListener('blur', () => {
			going_down = false;
			going_up = false;
		})

		function keyup_handler(event: KeyboardEvent) {
			if (["S", "s", "ArrowDown"].some(name => event.key == name)) {
				going_down = false;
			} else if (["W", "w", "ArrowUp"].some(name => event.key == name)) {
				going_up = false;
			}
		}

		function setSpeedModificator(event: KeyboardEvent) {
			if (p.custom_mode) {
				if (event.shiftKey == event.ctrlKey) {
					speed_modificator = 1;
				} else if (event.shiftKey) {
					speed_modificator = 1.75;
				} else {
					speed_modificator = 0.5
				}
			}
		}

		function keydown_handler(event: KeyboardEvent) {
			if (["S", "s", "ArrowDown"].some(name => event.key == name)) {
				setSpeedModificator(event)
				going_down = true;
			} else if (["W", "w", "ArrowUp"].some(name => event.key == name)) {
				setSpeedModificator(event)
				going_up = true;
			}
		}

		var_socket.on(ServerEvents.end_game, (result: MatchOutput) => {
			left_racket.score = result.p1.score;
			right_racket.score = result.p2.score;

			stopGame();
		})

		function stopGame() {
			window.removeEventListener('keydown', keydown_handler);
			window.removeEventListener('keyup', keyup_handler);
			going_down = false;
			going_up = false;
			speed_modificator = 1;
			ball.speed = 0;
			ball.vector_x = 0;
			ball.vector_y = 0;
			setTimeout(() => {
				left_racket = {x: 0, y: START_POSITION_Y, color: "#ffffff", score: 0, size: RACKET_SIZE_Y};
				right_racket = {x: CANVAS_SIZE_X - RACKET_SIZE_X, y: START_POSITION_Y, color: "#ffffff", score: 0, size: RACKET_SIZE_Y};
				ball = {x: CANVAS_SIZE_X / 2, y: CANVAS_SIZE_Y / 2, vector_x: 0, vector_y: 0, speed: 0, reached_maximum: false, going_left: true}
				p.in_game(false);
				p.in_queue(false);
			}, 2500)
		}

		return <Sketch setup={setup} draw={draw} />;
});

export default Pong
