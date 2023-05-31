// =========================================================================
// ---------------------------------- OTP ----------------------------------
// =========================================================================
import {
	Logger,
	Injectable,
	Query,
	Post,
	Req,
	Res,
	UseGuards,
	NotFoundException,
	HttpException,
	BadRequestException
} from "@nestjs/common";

import { Request, Response } from "express";
import * as otplib           from 'otplib';
import { UserService } from "src/db/user/services/user.service";
import * as qr from 'qrcode';

import * as crypto from 'crypto'
import { PatchUserDto, PrivatePatchUserDto } from "src/db/user/dtos/patch-user.dto";

// =============================================================================
// Better than ECB mode
// Which is used for dev - CBC is better for prod
// =============================================================================
const algorithm = 'aes-256-cbc';

// =============================================================================
// ----------------- Converting strings to hex of type Buffer ------------------
// =============================================================================
const key = Buffer.from(process.env.OTP_CRYPTO_PASSWORD, 'hex')
const iv = Buffer.from(process.env.OTP_CRYPTO_IV, 'hex')

function encrypt(text: string) {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted ;
}
function decrypt(text: string) {
	const encryptedText = text;
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}

@Injectable()
export class AuthOTPService {
	constructor(private readonly userService: UserService) {}
	// -----------------------------------------------------
	// Generating secret
	// -----------------------------------------------------
	async otp_generate(
		id: number,
		login: string,
		res: Response
	): Promise<{url: string, secret: string}> {
		const otp = otplib.authenticator
		const user = await this.userService.getUserById(id)
		if (!user) {
			throw new NotFoundException('User not found')
		}
		if (user.otp_state == false) {
			const otp_secret = otp.generateSecret();
			const userDTO : PrivatePatchUserDto = {
				...user,
				otp_state : false,
				otp_secret: encrypt(otp_secret)
			};
			try {this.userService.updateUserByLogin(user.login, userDTO) }
			catch (error) {Logger.error(error)}
			const otpUrl = otplib.authenticator.keyuri(login, "Ft_Transcendance", otp_secret);
			Logger.log('otpurl ' + JSON.stringify(otpUrl));
			res.type('image/png');
			res.send({url: otpUrl,secret: otp_secret})
			return ({url: otpUrl, secret: otp_secret});
		} else {
			throw new BadRequestException('User already have a secret');
		}
	}
	// -----------------------------------------------------
	// Saving the secret after confirmation by response code
	// -----------------------------------------------------
	async otp_enable(
		id: number,
		res: Response,
		code: string,
	) {
		const otp = otplib.authenticator;
		const user = await this.userService.getUserById(id);
		const secret = decrypt(user.otp_secret);
		if (otp.check(code, secret)) {
			const userDTO : PrivatePatchUserDto = {
				...user,
				otp_state : true,
				otp_verified : true,
				otp_secret: encrypt(secret)
			};
			try { this.userService.updateUserByLogin(user.login, userDTO) }
			catch (error) {Logger.error(error)}
			res.send(true)
			return ("OK - OTP saved in DB")
		}
		res.send(false)
		return("NOT OK - OTP Save failed")
	}

	// =========================================================================
	// Disabling otp
	// =========================================================================
	async otp_disable (
		id: number,
		res: Response,
		code: string
	)
	{
		const otp = otplib.authenticator;
		const user = await this.userService.getUserById(id);
		const secret = decrypt(user.otp_secret);
		if (otp.check(code, secret)) {
			const userDTO = {
				...user,
				otp_state : false,
			};
			try { this.userService.updateUserByLogin(user.login, userDTO) }
			catch (error) {Logger.error(error)}
			res.send(true)
			return ("OK - OTP disabled")
		}
		res.send(false)
		return("NOT OK - OTP disable failed")
	}
}
