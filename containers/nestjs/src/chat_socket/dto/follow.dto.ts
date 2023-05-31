import { IsInt, Min } from "class-validator";

export class FollowDto {
	@IsInt()
	@Min(1)
	id: number;
}
