import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ban } from "src/typeorm/entities/Ban";
import { Channel } from "src/typeorm/entities/Channel";
import { User } from "src/typeorm/entities/User";
import { ChannelUsers } from "src/typeorm/views/ChannelUsers";
import { UserProfile } from "src/typeorm/views/UserProfile";
import { ChannelController } from "./controllers/channels.controller";
import { ChannelService } from "./services/channel.service";

@Module({
	imports: [TypeOrmModule.forFeature([Channel, User, UserProfile, ChannelUsers, Ban])],
	controllers: [ChannelController],
	providers: [ChannelService],
	exports: [ChannelService]
})
export class ChannelModule {}
