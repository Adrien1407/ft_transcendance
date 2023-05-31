import { createParamDecorator, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Request } from "express";
import * as util from 'util';

export const Jwt = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const request: Request = ctx.switchToHttp().getRequest()
		const jwt = request.user

		return data ? jwt?.[data] : jwt;
	}
)
