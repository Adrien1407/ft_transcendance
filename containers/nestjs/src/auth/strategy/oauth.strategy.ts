import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { profile } from "console";
import { InternalOAuthError, Strategy, VerifyCallback } from 'passport-oauth2'

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft') {
	constructor () {
		console.log(process.env.CLIENT_ID)
		super({
			authorizationURL: "https://api.intra.42.fr/oauth/authorize",
			tokenURL: "https://api.intra.42.fr/oauth/token",
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.CALLBACK_URL,
		})
	}

	userProfile(accessToken: string, done: (err?: Error, profile?: any) => void): void {
		this._oauth2.get("https://api.intra.42.fr/v2/me", accessToken, (err: any, res: string) => {
			if (err) {
				throw new InternalOAuthError('Cannot get user informations', err);
			}
			let json: Object;
			try {
				json = JSON.parse(res);
			} catch (err) {
				throw new InternalOAuthError('Cannot get user informations', err);
			}
			done(null, json);
		});
	}

	async validate(
		_access_token: string,
		_refresh_token: string,
		profile: any,
		done: VerifyCallback,
	): Promise<any> {
		const {image, login} = profile;
		let user = {
			picture: image.link,
			login: login
		};
		done(null, user);
	}
}
