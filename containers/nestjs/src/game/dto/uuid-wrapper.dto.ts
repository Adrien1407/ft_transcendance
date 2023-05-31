import { IsNotEmpty, IsUUID } from "class-validator";

export class UUIDWrapper {
	@IsNotEmpty()
	uuid: string;
}
