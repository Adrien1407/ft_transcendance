import { IsInt, Max, Min } from "class-validator";

export class RacketDto {
	@Min(0) // 0 + RACKET_SIZE_Y / 2
	@Max(500) // 500 - RACKET_SIZE_Y / 2
	position_y: number;
}
