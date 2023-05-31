import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/typeorm/entities/User";
import { Repository } from "typeorm";

function cookieExtractor(req: Request) {
	if (req && req.cookies)
		return req.cookies.jwt
	return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	@InjectRepository(User)
	private userRepository: Repository<User>;
	constructor() {
		super({
			jwtFromRequest: cookieExtractor,
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_KEY,
		});
	}


	async validate(payload: any) {
		if (!payload){
			Logger.error('JWTStrategy: nopayload')
			return null;
		}
		if (payload.is_otp == true && payload.otp_verified == false) {
			Logger.debug("2fa activated but not verified");
			// return null;
		}
		if (await this.userRepository.count({where: {login: payload.user.login}}) == 0) {
			Logger.debug("No such user in DB");
			return null;
		}
		return { id: payload.user.id, login: payload.user.login, is_otp: payload.is_otp, otp_verified: payload.otp_verified }
	}
}

@Injectable()
export class JwtOtpStrategy extends PassportStrategy(Strategy, 'jwt-otp') {
	@InjectRepository(User)
	private userRepository: Repository<User>;
	constructor() {
		super({
			jwtFromRequest: cookieExtractor,
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_KEY,
		});
	}


	async validate(payload: any) {
		if (!payload){
			Logger.error('JWTStrategy: nopayload')
			return null;
		}
		if (payload.is_otp == true && payload.otp_verified == false) {
			Logger.debug("2fa activated but not verified");
			return null;
		}
		if (await this.userRepository.count({where: {login: payload.user.login}}) == 0) {
			Logger.debug("No such user in DB");
			return null;
		}
		return { id: payload.user.id, login: payload.user.login, is_otp: payload.is_otp, otp_verified: payload.otp_verified }
	}
}
