import { AuthGuard } from "@nestjs/passport";

export class JWTGuard extends AuthGuard('jwt') {}
export class JWTOtpGuard extends AuthGuard('jwt-otp') {}
