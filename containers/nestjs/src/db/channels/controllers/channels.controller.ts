import { Controller, Get, Param, Post, Body, Query, UsePipes, ValidationPipe, ParseIntPipe, HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { IsInt } from 'class-validator';
import { channel } from 'diagnostics_channel';
import { JWTOtpGuard } from 'src/auth/guards/jwt.guard';
import { IdWrapperDto } from 'src/db/user/dtos/id-wrapper.dto';
import { Channel } from 'src/typeorm/entities/Channel';
import { ChannelUsers } from 'src/typeorm/views/ChannelUsers';
import { UserProfile } from 'src/typeorm/views/UserProfile';
import { Jwt } from 'src/utils/jwt.decorator';
import { ReturnChannel, ReturnChannel2, ReturnMessage } from '../classes/message.class';
import { ChannelService } from '../services/channel.service';

@Controller('channel')
@UsePipes(new ValidationPipe())
@UseGuards(new JWTOtpGuard())
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@Get()
	async getChannels(): Promise<ReturnChannel[]> {
		return await this.channelService.getPublicChannels();
	}

	@Get('not_joined')
	async getNotJoinedChannels(@Jwt('id') id: number): Promise<ReturnChannel[]> {
		return await this.channelService.getNotJoinedPublicChannels(id);
	}

	@Get(':id')
	async getChannel(@Jwt('id') user: number, @Param('id', ParseIntPipe) channel: number): Promise<ReturnChannel2> {
		return await this.channelService.getChannel(user, channel);
	}

	@Get(':id/messages')
	async getChannelMessages(@Param('id', ParseIntPipe) channel: number, @Jwt('id') id: number): Promise<ReturnMessage[]> {
		return await this.channelService.getChannelMessages(channel, id);
	}
	@Get(':id/users')
	async getChannelUsers(@Param('id', ParseIntPipe) channel: number, @Jwt('id') id: number): Promise<UserProfile[]> {
		return await this.channelService.getUsersOfChannel(channel, id);
	}
	@Get(':id/ban')
	async getChannelBanned(@Param('id', ParseIntPipe) channel: number, @Jwt('id') id: number): Promise<UserProfile[]> {
		return await this.channelService.getBannedOfChannel(channel, id);
	}

	@Get(':id/mute')
	async getChannelMute(@Param('id', ParseIntPipe) channel: number, @Jwt('id') id: number): Promise<UserProfile[]> {
		return await this.channelService.getMuteOfChannel(channel, id);
	}

	@Get(':id/chanops')
	async getChannelChanops(@Param('id', ParseIntPipe) channel: number, @Jwt('id') id: number): Promise<UserProfile[]> {
		return await this.channelService.getChanopsOfChannel(channel, id);
	}

	// @Get('me')
	// async getUserChannels(@Query('id', ParseIntPipe) channel: IdWrapperDto): Promise<Channel[]> {
	// 	return this.channelService.getUserChannels(channel.id);
	// }
}
