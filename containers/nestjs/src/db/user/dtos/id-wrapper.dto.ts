import { IsInt, IsNotEmpty, Min } from "class-validator";

export class IdWrapperDto {
	@IsInt()
	@Min(1)
	id: number;
}

export class LoginWrapperDto {
	@IsNotEmpty()
	login: string;
}
