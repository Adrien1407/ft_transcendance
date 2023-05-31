import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException, UnauthorizedException, UsePipes, ValidationPipe } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { ChangeVisibilityDto, ChangeNameDto } from "src/chat_socket/dto/channel.dto";
import { ChannelStatus } from "src/chat_socket/enum/channel.status";
import { Channel } from "src/typeorm/entities/Channel";
import { User } from "src/typeorm/entities/User";
import { Like, Repository, SelectQueryBuilder } from "typeorm";
import { CreateChannelDto, CreateDMChannelDto, CreateNormalChannelDto, CreatePasswordChannelDto } from "../dto/create-channel.dto";
import * as bcrypt from 'bcrypt'
import { validate } from "class-validator";
import { ReturnChannel, ReturnChannel2, ReturnMessage } from "../classes/message.class";
import { UserProfile } from "src/typeorm/views/UserProfile";
import { ChannelUsers } from "src/typeorm/views/ChannelUsers";
import { SanctionTypes } from "src/chat_socket/enum/ban.types";
import { Ban } from "src/typeorm/entities/Ban";

@Injectable()
@UsePipes(new ValidationPipe())
export class ChannelService {
	@InjectRepository(Channel)
	private channelRepository: Repository<Channel>;
	@InjectRepository(User)
	private userRepository: Repository<User>;
	@InjectRepository(Ban)
	private banRepository: Repository<Ban>;
	@InjectRepository(UserProfile)
	private userProfileRepository: Repository<UserProfile>;
	@InjectRepository(ChannelUsers)
	private channelUsersRepository: Repository<ChannelUsers>;

	async isOwner(user_id: number, channel_id: number): Promise<boolean> {
		Logger.debug("isOwner: Start");

		let is_chanop = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.owner', 'channel_owner')
			.where('channel.id = :channel_id AND channel_owner.id = :user_id', {
				user_id: user_id,
				channel_id: channel_id
			})
			.getCount() != 0

		Logger.debug("isOwner: End");
		return is_chanop;
	}

	async checkIfUserInChannel(channel_id: number, user_id: number) {
		let does_user_exist = await this.channelRepository
		.createQueryBuilder('channel')
		.leftJoin('channel.users', 'user')
		.where('channel.id = :channel_id AND user.id = :user_id', {channel_id, user_id})
		.getCount()

		if (does_user_exist == 0) {
			throw new UnauthorizedException('User is not in channel');
		}
	}

	createQueryGetUser(channel_alias: string ='channel', user_alias: string ='user'): SelectQueryBuilder<Channel> {
		return this.channelRepository
			.createQueryBuilder(channel_alias)
			.select([
				`${user_alias}.id as id`,
				`${user_alias}.login as login`,
				`${user_alias}.displayName as displayName`,
				`${user_alias}.picture AS picture`,
				`${user_alias}.state AS state`,
				`${user_alias}.current_game AS current_game`,
				`${user_alias}.elo AS elo`,
			])
	}

	async getUsersOfChannel(channel_id: number, user_id: number): Promise<UserProfile[]> {
		await this.checkIfUserInChannel(channel_id, user_id);

		let res = await this.createQueryGetUser()
			.leftJoin("channel.users", "user")
			.where("channel.id = :channel_id", {channel_id})
			.getRawMany();

		return (res);
	}
	async getBannedOfChannel(channel_id: number, user_id: number): Promise<UserProfile[]> {
		await this.checkIfUserInChannel(channel_id, user_id);

		let res = await this.banRepository
			.createQueryBuilder('ban')
			.leftJoin('ban.user', 'user')
			.select([
				'user.login AS login',
				'user.id AS id',
				'user.displayName AS displayName',
				'user.picture AS picture',
				'ban.ban_time AS ban_time'
			])
			.where(`
					"ban"."channelId" = :channel_id
				AND "ban"."ban_time" > NOW()
				AND "ban"."type" = :ban_type`,
				{channel_id, user_id, ban_type: SanctionTypes.Ban})
			.getRawMany()

		return (res);
	}
	async getMuteOfChannel(channel_id: number, user_id: number): Promise<UserProfile[]> {
		await this.checkIfUserInChannel(channel_id, user_id);

		let res = await this.banRepository
			.createQueryBuilder('ban')
			.leftJoin('ban.user', 'user')
			.select([
				'user.id AS id',
				'user.login AS login',
				'user.displayName AS displayName',
				'ban.ban_time AS ban_time'
			])
			.where(`
					"ban"."channelId" = :channel_id
				AND "ban"."ban_time" > NOW()
				AND "ban"."type" = :ban_type`,
				{channel_id, user_id, ban_type: SanctionTypes.Mute})
			.getRawMany()

		return (res);
	}
	async getChanopsOfChannel(channel_id: number, user_id: number): Promise<UserProfile[]> {
		await this.checkIfUserInChannel(channel_id, user_id);

		let res = await this.createQueryGetUser()
			.leftJoin("channel.chanops", "user")
			.where("channel.id = :channel_id", {channel_id})
			.getRawMany();
		Logger.log(JSON.stringify(res));
		return (res);
	}

	async getChannelMessages(chan_id: number, user_id: number): Promise<ReturnMessage[]> {
		let is_in_channel = await this.channelRepository
			.createQueryBuilder('chan')
			.leftJoin('chan.users', 'user')
			.where('user.id = :user_id AND chan.id = :chan_id', {user_id, chan_id})
			.getCount() != 0

		if (!is_in_channel) {
			throw new ForbiddenException('User is not in channel');
		}

		return await this.channelRepository
			.createQueryBuilder('chan')
			.leftJoin('chan.messages', 'message')
			.leftJoin('message.user', 'user')
			.select([
				'message.content AS content',
				'user.id AS user_id',
				'user.login AS user_login',
				'user.displayName AS user_display_name',
				'user.picture AS user_picture',
				'chan.id AS channel_id',
				'message.is_pong_invite AS is_pong_invite',
				'message.game_id AS game_id',
				'message.created_at AS created_at',
			])
			.where('chan.id = :chan_id', {chan_id})
			.orderBy('message.created_at', 'ASC')
			.getRawMany()
	}

	async getPublicChannels(): Promise<ReturnChannel[]> {
		return await this.channelRepository
			.createQueryBuilder('channel')
			.select([
				'channel.id AS id',
				'channel.name AS name',
				'channel.type AS type',
			])
			.where('channel.type = :pub OR channel.type = :pass', {pub: ChannelStatus.public, pass: ChannelStatus.password})
			.getRawMany();
	}

	async getNotJoinedPublicChannels(id: number): Promise<ReturnChannel[]> {
		let tmp = this.channelRepository
			.createQueryBuilder('channel')
			.leftJoin('channel.users', 'user', 'user.id = :id', {id})
			.select([
				'channel.id AS id',
				'channel.name AS name',
				'channel.type AS type',
			])
			.distinct(true)
			.where(`
			("channel"."type" = :pub OR "channel"."type" = :pass)
			AND NOT EXISTS (
				SELECT "user"."id"
				FROM "user"
				LEFT JOIN "user_channels" ON "user"."id" = "user_channels"."user_id"
				LEFT JOIN "ban" ON "user"."id" = "ban"."userId"
				WHERE
					("channel"."id" = "user_channels"."channel_id" AND "user"."id" = :id)
			 	 OR ("channel"."id" = "ban"."channelId" AND "ban"."type" = :ban AND "user"."id" = :id AND "ban"."ban_time" > NOW())
			)`, {pub: ChannelStatus.public, pass: ChannelStatus.password, id, ban: SanctionTypes.Ban});

		return await tmp.getRawMany()
	}

	async getChannel(user_id: number, channel_id: number): Promise<ReturnChannel2> {
		await this.checkIfUserInChannel(channel_id, user_id)

		let basic_infos: ReturnChannel2 = await this.channelRepository.findOne({
			relations: ['users', 'owner'],
			where: {id: channel_id},
			select: [
				'id',
				'name',
				'type',
				'owner',
				'users',
			]
		})
		return basic_infos;
	}

	async getUserChannels(id: number): Promise<Channel[]> {
		return await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoin('channel.users', 'channel_users')
			.where("channel_users.id = :id")
			.setParameter('id', id)
			.getMany();
	}

	async createOrFindDMChannel(creator_id: number, channel: CreateDMChannelDto): Promise<ReturnChannel> {
		Logger.debug('createDMChannel: Start')

		let already_existing_channel = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoin('channel.users', 'channel_users')
			.leftJoin('channel.users', 'second_users')
			.where('channel.type = :dm_type \
			AND ( \
				(channel_users.id = :creator_id AND second_users.login = :invited_login) \
				OR (channel_users.login = :invited_login AND second_users.id = :creator_id) \
			)')
			.setParameters({
				dm_type: ChannelStatus.directMessage,
				creator_id: creator_id,
				invited_login: channel.other_login
			})
			.getOne()

		if (already_existing_channel) {
			return {
				...already_existing_channel,
				owner_id: null
			};
		}

		let user_id: {id: number} = await this.userRepository
			.createQueryBuilder('user')
			.select('user.id', 'id')
			.where('user.login = :login', {login: channel.other_login})
			.getRawOne()

		if (!user_id) {
			Logger.debug('createDMChannel: User doesn\'t exist');
			throw new NotFoundException('User doesn\'t exist');
		}

		let chan = await this.channelRepository.save(channel);

		await this.channelRepository
			.createQueryBuilder()
			.relation('users')
			.of(chan.id)
			.add(creator_id);

		await this.channelRepository
			.createQueryBuilder()
			.relation('users')
			.of(chan.id)
			.add(user_id.id);

		Logger.debug('createDMChannel: End')
		return {
			...chan,
			owner_id: null
		};
	}

	async hashPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(10);
		return await bcrypt.hash(password.toLowerCase(), salt);
	}

	async createPasswordChannel(creator_id: number, channel: CreatePasswordChannelDto): Promise<ReturnChannel> {
		Logger.debug("createPasswordChannel: Start");

		channel.owner = new User();
		channel.owner.id = creator_id;
		channel.password = await this.hashPassword(channel.password)

		let chan = await this.channelRepository.save(channel);

		await this.channelRepository
			.createQueryBuilder()
			.relation('users')
			.of(chan.id)
			.add(creator_id);

		await this.channelRepository
			.createQueryBuilder()
			.relation('chanops')
			.of(chan.id)
			.add(creator_id)

		Logger.debug("createPasswordChannel: End");
		return {
			...chan,
			owner_id: creator_id
		};
	}

	async createChannel(creator_id: number, channel: CreateNormalChannelDto): Promise<ReturnChannel> {
		Logger.debug("createChannel: Start");

		channel.owner = new User();
		channel.owner.id = creator_id;
		let chan = await this.channelRepository.save(channel)

		await this.channelRepository
			.createQueryBuilder()
			.relation('users')
			.of(chan.id)
			.add(creator_id);

		await this.channelRepository
			.createQueryBuilder()
			.relation('chanops')
			.of(chan.id)
			.add(creator_id)

		Logger.debug("createChannel: End");
		return {
			...chan,
			owner_id: creator_id
		};
	}

	async changeVisibility(user: number, changeDto: ChangeVisibilityDto) {
		Logger.debug('Change Channel Visibility: Start')
		if (!this.isOwner(user, changeDto.channel_id)) {
			Logger.debug('Change Channel Visibility: Cannot change visibility')
			throw new WsException('Cannot change visibility');
		}
		this.channelRepository
			.createQueryBuilder()
			.update()
			.set({
				type: changeDto.new_visibility,
				password: changeDto.password ? await this.hashPassword(changeDto.password) : null
			})
			.where("id = :channel_id", { channel_id: changeDto.channel_id })
			.execute()
		Logger.debug('Change Channel Visibility: End')
	}

	async changeName(user: number, changeDto: ChangeNameDto) {
		Logger.debug('Change Channel Visibility: Start')

		if (!this.isOwner(user, changeDto.channel_id)) {
			Logger.debug('Change Channel Visibility: Cannot change visibility')
			throw new WsException('Cannot change visibility');
		}
		this.channelRepository
			.createQueryBuilder()
			.update()
			.set({
				name: changeDto.new_name
			})
			.where("id = :channel_id", { channel_id: changeDto.channel_id })
			.execute()
		Logger.debug('Change Channel Visibility: End')
	}
}

