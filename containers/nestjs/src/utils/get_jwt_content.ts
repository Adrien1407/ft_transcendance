import { Socket } from "socket.io";
import * as jwt from 'jsonwebtoken'
import { UserInterface } from "src/chat_socket/interface/user.interface";

export function getJwtContentFromSocket(socket: Socket): UserInterface {
	let decoded_jwt: any;
	try {
		let cookies = socket.handshake.headers.cookie;
		let token = cookies.split(';').find(v => v.startsWith('jwt='))?.split('=')[1]
		decoded_jwt = jwt.verify(token as string, process.env.JWT_KEY);
	} catch (error) {
		return null;
	}
	return decoded_jwt.user;
}
