import { BadRequestException, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server } from "socket.io";
import { User } from "src/typeorm/entities/User"
import { Repository } from "typeorm";
import { AddToChannelDto, ChangeVisibilityDto, JoinChannelDto, BanFromChannelDto, MuteInChannelDto, PromotionDto, LeaveChannelDto, BlockUserDto, UnblockUserDto, ChangeNameDto } from "../dto/channel.dto";
import { InviteDto, MessageDto } from "../dto/message.dto";
import { ClientEvents } from "../enum/client.events";
import { ServerEvents } from "../enum/server.events";
import { ChatSocket } from "../model/chat-socket.model";
import { ChannelStatus } from "../enum/channel.status";
import { JWTOtpGuard } from "src/auth/guards/jwt.guard";
import { SanctionTypes } from "../enum/ban.types";
import { UserStatus } from "../enum/user.status";
import { WsDtoFilter } from "../filter/WsDtoFilter.filter";
import { UserInterface } from "../interface/user.interface";
import { ChannelService } from "src/db/channels/services/channel.service";
import { CreateDMChannelDto, CreateNormalChannelDto, CreatePasswordChannelDto, CreateChannelDto } from "src/db/channels/dto/create-channel.dto";
import { UserService } from "src/db/user/services/user.service";
import { SanctionDto, UnsanctionDto } from "src/db/user/dtos/sanction.dto";
import { FollowDto } from "../dto/follow.dto"
import { getJwtContentFromSocket } from "src/utils/get_jwt_content";
import { ReturnChannel } from "src/db/channels/classes/message.class";
import { validate, validateOrReject } from "class-validator";
import { IdWrapperDto, LoginWrapperDto } from "src/db/user/dtos/id-wrapper.dto";

@WebSocketGateway({
	namespace: 'chat',
	cors: true
})
@UseFilters(new WsDtoFilter())
@UsePipes(new ValidationPipe())
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private server: Server;
	@InjectRepository(User)
	private userRepository: Repository<User>;

	constructor(private channelService: ChannelService, private userService: UserService) {}

	afterInit() {}

	@UseGuards(new JWTOtpGuard())
	async handleConnection(@ConnectedSocket() socket: ChatSocket) {
		let user = getJwtContentFromSocket(socket);
		if (!user) {
			socket.disconnect()
			return;
		}
		socket.data.user = user;

		let blocked: UserInterface[] = await this.userRepository
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.blocked', 'user_blocked')
		.select('user_blocked.id AS id')
		.where('user.id = :user_id', { user_id: socket.data.user.id })
		.getRawMany()

		socket.emit(ServerEvents.blocklist, blocked.map(v => v.id))

		let channels: UserInterface[] = await this.userRepository
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.channels', 'user_channels')
		.select('user_channels.id AS id')
		.where('user.id = :user_id', { user_id: socket.data.user.id })
		.getRawMany();

		channels.forEach(c => {
			if (c && c.id) {
				socket.join(c.id.toString())
			}
		});
		socket.join('user' + socket.data.user.id.toString());

		await this.changeUserStatus(socket, UserStatus.online)
		const date = new Date();
		await this.changeUserLastConnectionTime(socket, date)
	}

	async handleDisconnect(@ConnectedSocket() socket: ChatSocket) {
		await this.changeUserStatus(socket, UserStatus.offline)
		//this.changeUserOtpStatus(socket, false)
		const date = new Date()
		await this.changeUserLastDisconnectionTime(socket, date)
	}

	@SubscribeMessage(ClientEvents.message)
	async handleMessage(@ConnectedSocket() socket: ChatSocket, @MessageBody() received_message: MessageDto) {
		let socket_message = await this.userService.sendMessage(socket.data.user.id, received_message);
		socket.broadcast.to(received_message.room.toString()).emit(ServerEvents.message, socket_message);
	}

	@SubscribeMessage(ClientEvents.invite_to_game)
	async handleInviteToGame(@ConnectedSocket() socket: ChatSocket, received_message: InviteDto) {
		let socket_message = await this.userService.sendInvite(socket.data.user.id, socket.data.user.displayName, received_message);
		socket.broadcast.to(received_message.room.toString()).emit(ServerEvents.message, socket_message);
	}

	@SubscribeMessage(ClientEvents.create_channel)
	async handleChannelCreation(@ConnectedSocket() socket: ChatSocket, @MessageBody() received_channel: CreateChannelDto): Promise<number> {
		let chan: ReturnChannel;
		let errors: string[];
		switch (received_channel.type) {
			case ChannelStatus.directMessage:
				let casted_dm_chan = received_channel as CreateDMChannelDto;
				chan = await this.channelService.createOrFindDMChannel(socket.data.user.id, casted_dm_chan);
				let other_user = await this.userService.getUserByLogin(casted_dm_chan.other_login)
				this.server.to("user" + other_user.id).socketsJoin(chan.id.toString())
				break;
			case ChannelStatus.password:
				let casted_pass_chan = received_channel as CreatePasswordChannelDto;
				chan = await this.channelService.createPasswordChannel(socket.data.user.id, casted_pass_chan);
				break;
			default:
				let casted_normal_chan = received_channel as CreateNormalChannelDto;
				chan = await this.channelService.createChannel(socket.data.user.id, casted_normal_chan)
				break;
		}
		socket.join(chan.id.toString());
		return chan.id
	}

	@SubscribeMessage(ClientEvents.join_channel)
	async handleChannelJoin(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel_join: JoinChannelDto): Promise<boolean> {
		await this.userService.joinChannel(socket.data.user.id, channel_join);
		socket.join(channel_join.id.toString());
		return true;
	}

	@SubscribeMessage(ClientEvents.leave_channel)
	async handleChannelLeave(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel_leave: LeaveChannelDto):Promise<boolean> {
		await this.userService.leaveChannel(socket.data.user.id, channel_leave.id);
		socket.leave(channel_leave.id.toString());
		return true;
	}

	@SubscribeMessage(ClientEvents.block_user)
	async handleBlockUser(@ConnectedSocket() socket: ChatSocket, @MessageBody() user_id: LeaveChannelDto) : Promise<boolean> {

		let blocked: UserInterface[] = await this.userRepository
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.blocked', 'blocked_id')
		.select('blocked_id.id AS id')
		.where('user.id = :user_id', { user_id: socket.data.user.id })
		.getRawMany()

		socket.emit(ServerEvents.blocklist, blocked.map(v => v.id))

		await this.userService.blockUser(socket.data.user.id, user_id.id);
		return true;
	}

	@SubscribeMessage(ClientEvents.unblock_user)
	async handleUnblockUser(@ConnectedSocket() socket: ChatSocket, @MessageBody() user_id: UnblockUserDto) : Promise<boolean> {

		let blocked: UserInterface[] = await this.userRepository
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.blocked', 'blocked_id')
		.select('blocked_id.id AS id')
		.where('user.id = :user_id', { user_id: socket.data.user.id })
		.getRawMany()

		socket.emit(ServerEvents.blocklist, blocked.map(v => v.id))

		await this.userService.unblockUser(socket.data.user.id, user_id.id);
		return true;
	}

	@SubscribeMessage(ClientEvents.add_to_channel)
	async handleAddToChannel(@ConnectedSocket() socket: ChatSocket, @MessageBody() add_to_channel: AddToChannelDto):Promise<boolean> {
		await this.userService.addToChannel(socket.data.user.id, add_to_channel);
		this.server.to("user" + add_to_channel.user_id.toString()).socketsJoin(add_to_channel.channel_id.toString())
		return true;
	}

	@SubscribeMessage(ClientEvents.ban_from_channel)
	async handleBanFromChannel(@ConnectedSocket() socket: ChatSocket, @MessageBody() ban_from_channel: SanctionDto)  :Promise<boolean>  {
		await this.userService.sanctionInChannel(socket.data.user.id, ban_from_channel, SanctionTypes.Ban);
		this.server.in("user" + ban_from_channel.user_id.toString()).socketsLeave(ban_from_channel.channel_id.toString());
		return true;
	}

	@SubscribeMessage(ClientEvents.mute_in_channel)
	async handleMuteInChannel(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel: SanctionDto) : Promise<boolean> {
		await this.userService.sanctionInChannel(socket.data.user.id, channel, SanctionTypes.Mute);
		return true;
	}

	@SubscribeMessage(ClientEvents.unban_from_channel)
	async handleUnbanInChannel(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel: UnsanctionDto) :Promise<boolean>  {
		await this.userService.unsanctionInChannel(socket.data.user.id, channel);
		return true;
	}

	@SubscribeMessage(ClientEvents.unmute_in_channel)
	async handleUnmuteInChannel(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel: UnsanctionDto) :Promise<boolean>  {
		await this.userService.unsanctionInChannel(socket.data.user.id, channel);
		return true;
	}

	@SubscribeMessage(ClientEvents.change_visibility)
	async handleVisibilityChange(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel: ChangeVisibilityDto): Promise<boolean> {
		await this.channelService.changeVisibility(socket.data.user.id, channel);
		return true;
	}

	@SubscribeMessage(ClientEvents.change_name)
	async handleNameChange(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel: ChangeNameDto) : Promise<boolean> {
		await this.channelService.changeName(socket.data.user.id, channel);
		return true;
	}

	@SubscribeMessage(ClientEvents.promote)
	async handlePromotion(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel: PromotionDto)  :Promise<boolean> {
		await this.userService.promoteUser(socket.data.user.id, channel);
		return true
	}

	@SubscribeMessage(ClientEvents.demote)
	async handleDemotion(@ConnectedSocket() socket: ChatSocket, @MessageBody() channel: PromotionDto) : Promise<boolean> {
		await this.userService.demoteUser(socket.data.user.id, channel);
		return true
	}

	@SubscribeMessage(ClientEvents.add_friend)
	async addFriend(@ConnectedSocket() socket: ChatSocket, @MessageBody() user: FollowDto) {
		await this.userService.addFriend(socket.data.user.id, user.id);
	}

	@SubscribeMessage(ClientEvents.track_state)
	async trackState(@ConnectedSocket() socket: ChatSocket, @MessageBody() user: LoginWrapperDto) {
		socket.join("state" + user.login);
	}

	async changeUserStatus(socket: ChatSocket, new_status: UserStatus) {
		await this.userService.changeUserStatus(socket.data.user.id, new_status);
		this.changeState(socket.data.user.login, new_status)
	}

	async changeState(login: string, new_status: UserStatus, current_game?: string) {
		this.server.to("state" + login).emit(ServerEvents.track_state, {new_status, current_game});
	}

	async changeUserOtpStatus(socket: ChatSocket, otp_verified: boolean) {
		await this.userRepository
		.createQueryBuilder()
		.update()
		.set({ otp_verified: otp_verified})
		.where("id = :user_id")
		.setParameter('user_id', socket.data.user_id)
		.execute()
	}

	async changeUserLastConnectionTime(socket: ChatSocket, date : Date) {
		await this.userRepository
		.createQueryBuilder()
		.update()
		.set({ last_connection_time: date })
		.where("id = :user_id")
		.setParameter('user_id', socket.data.user_id)
		.execute()
	}

	async changeUserLastDisconnectionTime(socket: ChatSocket, date : Date) {
		await this.userRepository
		.createQueryBuilder()
		.update()
		.set({ last_disconnection_time: date })
		.where("id = :user_id")
		.setParameter('user_id', socket.data.user_id)
		.execute()
	}

	async sendGameInvitationMessage(message: string, channel: number) {
		this.server.to(channel.toString()).emit(ServerEvents.channel_game, {content: message, room: channel});
	}
}
