import { IsInt, Min } from "class-validator";

export class AddToChannelDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsInt()
	@Min(1)
	user_id: number;
}
