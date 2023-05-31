import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsUUID, MaxLength, Min, ValidateIf } from "class-validator";

export class MessageDto {
	@IsInt()
	@Min(1)
	room: number;

	@IsNotEmpty()
	@MaxLength(256)
	content: string;

	@IsBoolean()
	is_pong_invite: boolean = false;

	@ValidateIf((mess: MessageDto) => mess.is_pong_invite)
	@IsUUID()
	game_id?: string;
}

export class InviteDto {
	@IsInt()
	@Min(1)
	room: number;
}
