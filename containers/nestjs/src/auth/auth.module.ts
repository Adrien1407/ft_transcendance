import { forwardRef, Module         } from "@nestjs/common";
import { TypeOrmModule  } from '@nestjs/typeorm';

import { UserModule    } from '../db/user/user.module';
import { User           } from '../typeorm/entities/User';

import { JWTGuard, JWTOtpGuard       } from "./guards/jwt.guard";
import { AuthController } from "./controllers/auth.controller";

import { AuthOTPService    } from "./services/auth.otp.service";
import { FtStrategy } from "./strategy/oauth.strategy";
import { FtGuard } from "./guards/ft.guard";
import { JwtOtpStrategy, JwtStrategy } from "./strategy/jwt.strategy";
import { AuthService } from "./services/auth.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => UserModule),
		JwtModule.register({
			secret: process.env.JWT_KEY,
			signOptions: {expiresIn: '7d'}
		})
	],
	controllers : [
		AuthController
	],
	providers   : [
		JwtStrategy,
		JWTGuard,
		JwtOtpStrategy,
		JWTOtpGuard,

		AuthService,

		FtStrategy,
		FtGuard,

		AuthOTPService,
	]
})
export class AuthModule {}
