import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as cookieParser from 'cookie-parser';
import * as express from 'express';

import { join } from 'path';
import * as dotenv from 'dotenv'; // Import dotenv package

declare const module: any;

async function bootstrap() {
	dotenv.config(); // Load environment variables from .env file

	const app = await NestFactory.create(
		AppModule, {
	});
	const path = join(__dirname, '..', 'files')
	app.use('/files', express.static(path));
	app.use(cookieParser());

	// if (module.hot) {
	// 	module.hot.accept();
	// 	module.hot.dispose(() => app.close());
	// }

	await app.listen(3000);
}
bootstrap();
