import { Max, Min } from "class-validator";

export class BallDto {
	@Min(0)
	@Max(500) // = Canvas Size X
	x: number;

	@Min(0)
	@Max(500) // = Canvas Size Y
	y: number;

	@Min(-80) // = - MAX_SPEED
	@Max(80) // = + MAX_SPEED
	vector_x: number;

	@Min(-80) // = - MAX_SPEED
	@Max(80) // = + MAX_SPEED
	vector_y: number;

	@Min(0)
	@Max(80) // = MAX_SPEED
	speed: number;

	reached_maximum: boolean;
	going_left: boolean;
}
