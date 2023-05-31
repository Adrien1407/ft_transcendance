import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ban } from 'src/typeorm/entities/Ban';
import { Channel } from 'src/typeorm/entities/Channel';
import { Message } from 'src/typeorm/entities/message';
import { User } from 'src/typeorm/entities/User';
import { ScheduleModule } from '@nestjs/schedule'
import { ChatGateway } from './service/chat.gateway';
import { ChannelService } from 'src/db/channels/services/channel.service';
import { UserService } from 'src/db/user/services/user.service';
import { Match } from 'src/typeorm/entities/Match';
import { UserModule } from 'src/db/user/user.module';
import { Leaderboard } from 'src/typeorm/views/Leaderboard';
import { ChannelModule } from 'src/db/channels/channels.module';

@Module({
    imports: [
        UserModule,
        ChannelModule,
        TypeOrmModule.forFeature([Message, User, Channel, Ban, Match]),
    ],
    controllers: [],
    providers: [ChatGateway],
    exports: [ChatGateway]
})
export class ChatSocketModule {}
