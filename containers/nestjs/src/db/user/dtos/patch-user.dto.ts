import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Min, ValidateIf } from "class-validator";

export class PatchUserDto {
	// @IsNotEmpty()
	// login: string;

	@IsOptional()
	@IsNotEmpty()
	displayName?: string;

	// @IsOptional()
	// @IsNotEmpty()
	// picture?: string;

	// @IsOptional()
	// @IsBoolean()
	// otp_state?: boolean;

	// @IsOptional()
	// @IsNotEmpty()
	// otp_secret?: string;

	// @IsOptional()
	// @IsBoolean()
	// otp_verified?: boolean;

	// @IsOptional()
	// current_game?: string;
}

export class PrivatePatchUserDto {
	displayName?: string;
	picture?: string;
	otp_state?: boolean;
	otp_secret?: string;
	otp_verified?: boolean;
	current_game?: string;
}
