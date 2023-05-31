import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { Profile } from "src/db/user/classes/profile.class";
import { UserService } from "src/db/user/services/user.service";
import * as otp from 'otplib'
import * as crypto from "crypto";

export interface UserPayload {
	user: {login: string, id: number},
	is_otp: boolean,
	otp_verified: boolean,
}
export interface MyJwtPayload {
	login: string,
	id: number,
	is_otp: boolean,
	otp_verified: boolean,
}

const algorithm = 'aes-256-cbc';
const key       = Buffer.from(process.env.OTP_CRYPTO_PASSWORD, 'hex')
const iv        = Buffer.from(process.env.OTP_CRYPTO_IV, 'hex')
export function decrypt(text: string): string {
	const encryptedText = text;
	const decipher      = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted       = decipher.update(encryptedText, 'hex', 'utf8');
	decrypted          += decipher.final('utf8');
	return decrypted;
}

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
	) {}

	login(payload: UserPayload): string {
		Logger.log("user payload = " + JSON.stringify(payload))
		return this.jwtService.sign(payload);
	}

	async validate_user(profile: Profile, res: Response): Promise<UserPayload> {
		if (!profile)
			return null;
		let user = await this.userService.findOrCreateUser(profile);
		let userPayload: UserPayload = {user: {login: user.login, id: user.id }, is_otp: user.otp_state, otp_verified: false};
		// Only used because Chrome won't send cookie otherwise
		res.cookie('jwt', this.login(userPayload), {sameSite: 'strict'})
		return userPayload;
	}

	removeCookie(res: Response) {
		res.clearCookie('jwt', {sameSite: 'strict'} /* Same cookie options */)
	}

	async validate_otp(profile: MyJwtPayload, otp_code: string, res: Response) {
		if (!profile.is_otp) {
			// Logger.debug('OK - TOTP not activated');
			return ;
		}

		if (profile.otp_verified) {
			// Logger.debug('OK - TOTP already validated');
			return ;
		};

		let user = await this.userService.getUserById(profile.id);
		if (!user) {
			throw new ForbiddenException('User doesn\'t exist');
		}

		if (otp.authenticator.check(otp_code, decrypt(user.otp_secret))) {
			let new_cookie: UserPayload = {
				user: {
					login: profile.login,
					id: profile.id
				},
				is_otp: profile.is_otp,
				otp_verified: true
			};
			let token = this.jwtService.sign(new_cookie);
			res.cookie('jwt', token, {sameSite: 'strict'});
			res.send();
			return ;
		}
		throw new ForbiddenException('Wrong code');
	}
}
