export {};

declare global {
	namespace Express {
		interface Request {
			user: any;
			jwt : any
		}
	}
	interface JwtPayload
	{
		login:string
	}
}
