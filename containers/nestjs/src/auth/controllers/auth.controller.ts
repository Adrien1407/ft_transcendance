// =============================================================================
// ------------------------------ AUTH CONTROLLER ------------------------------
// =============================================================================
import {
	Logger,
	UseGuards,
	Controller,
	Query,
	Get,
	Post,
	Req,
	Res,
	Redirect,
	Param,
	HttpCode,
	HttpStatus,
}	from "@nestjs/common";

import { Request, Response } from "express";

import { JWTGuard, JWTOtpGuard          } from "../guards/jwt.guard";

import { AuthOTPService    } from "../services/auth.otp.service";
import { FtGuard } from "../guards/ft.guard";
import { Profile } from "src/db/user/classes/profile.class";
import { AuthService, MyJwtPayload, UserPayload } from "../services/auth.service";
import { Jwt } from "src/utils/jwt.decorator";
import { JwtOtpStrategy } from "../strategy/jwt.strategy";

// ---------------------------------------------------------
// ---------------------- CONTROLLER -----------------------
// ---------------------------------------------------------
@Controller ("/auth")
export class AuthController {
	constructor(
		private readonly authService       : AuthService,
		private readonly authOTPService    : AuthOTPService,
	) {}
	// =========================================================================
	// --------------------------------- TESTS ---------------------------------
	// =========================================================================
	@Get("/test_cookie")
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(JWTGuard)
	test_cookie() {}

	@Get("/test_2fa")
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(JWTOtpGuard)
	test_2fa() {}

	// =========================================================================
	// ---------------------------------- OTP ----------------------------------
	// =========================================================================
	@Get("/otp_generate")
	@UseGuards(JWTGuard)
	async otp_generate(
		@Jwt('id') id: number,
		@Jwt('login') login: string,
		@Res() res : Response
	): Promise<{url: string, secret: string}>
	{
		return await this.authOTPService.otp_generate(id, login, res)
	}

	/**
	 * @description Enables the OTP of a user, putting the encrypted secret in
	 *              the DB
	 * @param login User login from the JWT token
	 * @param res Express Response
	 * @param code Submitted OTP code from the user
	 * @returns
	 */
	@Post("/otp_enable")
	@UseGuards(JWTGuard)
	async otp_enable(
		@Jwt('id') id: number,
		@Res() res         : Response,
		@Query('code') code: string,
	)
	{
		return this.authOTPService.otp_enable(id, res, code)
	}

	/**
	 * @description Disable the OTP of a user
	 * @param login
	 * @param res
	 * @param code
	 * @returns
	**/
	@Post("/otp_disable")
	@UseGuards(JWTOtpGuard)
	async otp_disable (
		@Jwt('id') id: number,
		@Res() res         : Response,
		@Query('code') code: string
	) {return this.authOTPService.otp_disable(id, res, code)}

	/**
	 * @description Checks if the given otp is valid, and puts the validation in
	 *              the cookie.
	 * @param jwt The content of the JWT token
	 * @param res Express Response
	**/
	@Post("/otp_validate")
	@UseGuards(JWTGuard)
	async otp_validate(@Jwt() user: MyJwtPayload, @Query('totp') code: string, @Res() res: Response) {
		await this.authService.validate_otp(user, code, res);
	}

	/**
	 * @description Redirects the user to the Intra 42 page
	**/
	@Get("/getcode")
	@UseGuards(FtGuard)
	test_42() {}

	/**
	 * @description Gets the informations from 42 intra, puts the user in the
	 *              database and generate the JWT cookie
	 * @param req Express Request
	 * @param res Express Response
	 */
	@Get("/login")
	@UseGuards(FtGuard)
	async test_callback(@Req() req: Request, @Res() res: Response) {
		let payload = await this.authService.validate_user(req.user as Profile, res);
		if (!payload) {
			return;
		}
		if (payload.is_otp) {
			Logger.log("otp")
			res.redirect(process.env.FRONT_URL + "/2fa-input");
		} else {
			Logger.log("normal")
			res.redirect(`${process.env.FRONT_URL}/userpage`);
		}
	}

	@Get("/fake/:login")
	async fake_login(@Param('login') login: string, @Res() res: Response) {
		let user = {login: login, displayName: login};
		let payload = await this.authService.validate_user(user as Profile, res);
		if (!payload) {
			return;
		}
		if (payload.is_otp) {
			Logger.log("otp")
			res.redirect(process.env.FRONT_URL + "/2fa-input");
		} else {
			Logger.log("normal")
			res.redirect(`${process.env.FRONT_URL}/userpage`);
		}
	}

	/**
	 * @description Removes the JWT cookie
	 * @param res Express Response
	**/
	@Get("/logout")
	@Redirect(`${process.env.FRONT_URL}/`)
	logout(@Res() res: Response) {
		this.authService.removeCookie(res)
	}
}
