import { ChannelStatus } from "../enum/channel.status";
import { IsEmpty, IsEnum, IsInt, IsNotEmpty, IsOptional, Min, NotEquals, Validate, ValidateIf } from "class-validator"
import { User } from "src/typeorm/entities/User";

export class CreateChannelDto {
	@IsNotEmpty()
	name     : string;
	@IsEnum(ChannelStatus)
	type     : ChannelStatus;

	// If type is password
	password?: string;

	// If type is DM
	other_id?: number;

	@IsEmpty()
	owner: User;
}

export class JoinChannelDto {
	@IsInt()
	@Min(1)
	id: number;
	@IsOptional()
	@IsNotEmpty()
	password?: string;
}

export class LeaveChannelDto {
	@IsInt()
	@Min(1)
	id: number;
}

export class BlockUserDto {
	@IsInt()
	@Min(1)
	id: number;
}

export class UnblockUserDto {
	@IsInt()
	@Min(1)
	id: number;
}

export class AddToChannelDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsInt()
	@Min(1)
	user_id: number;
}

export class BanFromChannelDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsInt()
	@Min(1)
	user_id: number;

	@IsInt()
	@Min(1)
	time: number;
}

export class MuteInChannelDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsInt()
	@Min(1)
	user_id: number;

	@IsInt()
	@Min(1)
	time: number;
}

export class ChangeVisibilityDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsEnum(ChannelStatus)
	@NotEquals(ChannelStatus.directMessage)
	new_visibility: ChannelStatus;

	@ValidateIf((cvd: ChangeVisibilityDto) => cvd.new_visibility == ChannelStatus.password)
	@IsNotEmpty()
	password?: string;
}

export class ChangeNameDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsNotEmpty()
	new_name: string;
}

export class PromotionDto {
	@IsInt()
	@Min(1)
	channel_id: number;

	@IsInt()
	@Min(1)
	user_id: number;
}
