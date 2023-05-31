import { Socket } from "socket.io";
import { UserInterface } from "../interface/user.interface";

export type ChatSocket = Socket & {
	data: {
		user: UserInterface;
	}
}
