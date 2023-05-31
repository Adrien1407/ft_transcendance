import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController, AppTestController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './typeorm/entities/User';
import { AuthModule } from './auth/auth.module';
import { Message } from './typeorm/entities/message';
import { Match } from './typeorm/entities/Match';
import { GameModule } from './game/game.module';
import { Channel } from './typeorm/entities/Channel';
import { ChatSocketModule } from './chat_socket/chat.module';
import { Ban } from './typeorm/entities/Ban';
import { ChannelModule } from './db/channels/channels.module';
import { UserModule } from './db/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { Leaderboard } from './typeorm/views/Leaderboard';
import { UserProfile } from './typeorm/views/UserProfile';
import { ChannelUsers } from './typeorm/views/ChannelUsers';
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		AuthModule,
		GameModule,
		ChatSocketModule,
		ChannelModule,
		UserModule,
		TypeOrmModule.forRoot({
			type: "postgres",
			host: "postgres",
			port: 5432,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [User, Message, Channel, Match, Ban, Leaderboard, UserProfile, ChannelUsers],
			synchronize: true,
		}),
		ScheduleModule.forRoot()
	],
	controllers: [AppController, AppTestController], // Controls how to handle incoming requests, send back response
	providers: [AppService],   // Extra classes which are injectable in controllers
})

export class AppModule { }
