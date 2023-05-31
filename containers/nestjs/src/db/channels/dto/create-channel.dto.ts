import { IsEmpty, IsEnum, IsInt, IsNotEmpty, IsOptional, Min, NotEquals, ValidateIf } from "class-validator";
import { ChannelStatus } from "src/chat_socket/enum/channel.status";
import { User } from "src/typeorm/entities/User";

export class CreateDMChannelDto {
	@IsNotEmpty()
	other_login: string;

	owner: User;
}

export class CreatePasswordChannelDto {
	@IsNotEmpty()
	password?: string;

	@IsNotEmpty()
	name: string;

	owner: User;
}

export class CreateChannelDto {
	@ValidateIf((o: CreateChannelDto) => o.type == ChannelStatus.password)
	@IsNotEmpty()
	password?: string;

	@ValidateIf((o: CreateChannelDto) => o.type == ChannelStatus.directMessage)
	@IsNotEmpty()
	other_login?: string;

	@ValidateIf((o: CreateChannelDto) => o.type != ChannelStatus.directMessage)
	@IsNotEmpty()
	name?     : string;

	@IsEnum(ChannelStatus)
	type     : ChannelStatus;

	owner: User;
}

export class CreateNormalChannelDto {
	@IsNotEmpty()
	name?     : string;

	@IsEnum(ChannelStatus)
	@NotEquals(ChannelStatus.password)
	@NotEquals(ChannelStatus.directMessage)
	type     : ChannelStatus;

	owner: User;
}
