import { IsInt, Min } from "class-validator";

export class SanctionDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsInt()
	@Min(1)
	user_id: number;

	// Time in minutes
	@IsInt()
	@Min(1)
	time: number;
}

export class UnsanctionDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsInt()
	@Min(1)
	user_id: number;
}
