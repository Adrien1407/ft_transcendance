import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "src/typeorm/entities/Channel";
import { Match } from "src/typeorm/entities/Match";
import { User } from "src/typeorm/entities/User";
import { MatchService } from "./service/match.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Match, User]),
	],
	controllers: [],
	providers: [MatchService],
	exports: [MatchService],
})
export class MatchModule {}
