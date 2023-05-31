import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { Ban } from "src/typeorm/entities/Ban";
import { Channel } from "src/typeorm/entities/Channel";
import { Match } from "src/typeorm/entities/Match";
import { Message } from "src/typeorm/entities/message";
import { User } from "src/typeorm/entities/User";
import { Leaderboard } from "src/typeorm/views/Leaderboard";
import { UserProfile } from "src/typeorm/views/UserProfile";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Match, Channel, Ban, Message, Leaderboard, UserProfile]),
		forwardRef(() => AuthModule)
	],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService]
})
export class UserModule {}
