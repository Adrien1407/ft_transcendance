import { IsInt, Min } from "class-validator";

export class JoinChannelDto {
	@IsInt()
	@Min(1)
	id: number;
	password?: string;
}
