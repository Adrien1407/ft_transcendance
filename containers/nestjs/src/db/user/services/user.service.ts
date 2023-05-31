import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { SanctionTypes } from "src/chat_socket/enum/ban.types";
import { ChannelStatus } from "src/chat_socket/enum/channel.status";
import { Ban } from "src/typeorm/entities/Ban";
import { Channel } from "src/typeorm/entities/Channel";
import { Match } from "src/typeorm/entities/Match";
import { User } from "src/typeorm/entities/User";
import { inXMinutes } from "src/utils/inXMinutes";
import { Repository } from "typeorm";
import { ReturnAchievement } from "../classes/achievement.class";
import { ReturnMatch } from "../classes/matchs.class";
import { AddToChannelDto } from "../dtos/add-to-channel.dto";
import { SanctionDto, UnsanctionDto } from "../dtos/sanction.dto";
import { JoinChannelDto } from "../dtos/join-channel.dto";
import { PromotionDto } from "src/chat_socket/dto/channel.dto";
import { UserStatus } from "src/chat_socket/enum/user.status";
import { ReturnProfile, ReturnUser } from "../classes/user.class";
import { PatchUserDto, PrivatePatchUserDto } from "../dtos/patch-user.dto";
import { ServerInvite, ServerMessage } from "src/chat_socket/dto/server.events";
import { InviteDto, MessageDto } from "src/chat_socket/dto/message.dto";
import { Message } from "src/typeorm/entities/message";
import { Profile } from "../classes/profile.class"
import { ReturnChannel, UserIdentity } from "../classes/channel.class";
import { ReturnElo, ReturnStats } from "../classes/stats.class";
import * as bcrypt from 'bcrypt';
import { Cron } from "@nestjs/schedule";
import { Leaderboard } from "src/typeorm/views/Leaderboard";
import { UserProfile } from "src/typeorm/views/UserProfile";
import { type } from "os";

@Injectable()
export class UserService {
	@InjectRepository(User)
	private userRepository: Repository<User>
	@InjectRepository(Leaderboard)
	private leaderboardRepository: Repository<Leaderboard>
	@InjectRepository(UserProfile)
	private userProfileRepository: Repository<UserProfile>
	@InjectRepository(Match)
	private matchRepository: Repository<Match>
	@InjectRepository(Channel)
	private channelRepository: Repository<Channel>
	@InjectRepository(Ban)
	private banRepository: Repository<Ban>
	@InjectRepository(Message)
	private messageRepository: Repository<Message>

	async isChanop(user_id: number, channel_id: number): Promise<boolean> {
		Logger.debug("isChanop: Start");

		let is_chanop = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.chanops', 'user_chanops')
			.where('user.id = :user_id AND user_chanops.id = :channel_id', {
				user_id: user_id,
				channel_id: channel_id
			})
			.getCount() != 0

		Logger.debug("isChanop: End");
		return is_chanop;
	}

	async isOwner(user_id: number, channel_id: number): Promise<boolean> {
		Logger.debug("isOwner: Start");

		let is_owner = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.owner', 'channel_owner')
			.where('channel_owner.id = :user_id AND channel.id = :channel_id', {
				user_id: user_id,
				channel_id: channel_id
			})
			.getCount() != 0

		Logger.debug("isOwner: End");
		return is_owner;
	}

	async channelExists(chan_id: number): Promise<boolean> {
		return await this.channelRepository
			.createQueryBuilder()
			.where('id = :id', {id: chan_id})
			.getCount() != 0

	}

	async exists(user_id: number): Promise<boolean> {
		Logger.debug("exists: Start");

		let exists = await this.userRepository
			.createQueryBuilder('user')
			.where('user.id = :user_id', {
				user_id: user_id,
			})
			.getCount() != 0

		Logger.debug("exists: End");
		return exists;
	}

	async loginExists(user_login: string): Promise<boolean> {
		Logger.debug("exists: Start");

		let exists = await this.userRepository
			.createQueryBuilder('user')
			.where('user.login = :user_login', {
				user_login: user_login,
			})
			.getCount() != 0

		Logger.debug("exists: End");
		return exists;
	}

	async isUserInChannel(user: number, channel: number) {
		return await this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.channels', 'user_channels')
			.where('user.id = :user_id AND user_channels.id = :chan_id')
			.setParameters({
				user_id: user,
				chan_id: channel
			})
			.getCount()
	}

	async getAllUsers(): Promise<UserProfile[]> {
		return await this.userProfileRepository.find();
	}

	async getMatchByUserId(userId: number): Promise<ReturnMatch[]> {
		return await this.matchRepository
			.createQueryBuilder('match')
			.leftJoin('match.winner', 'match_winner')
			.leftJoin('match.loser', 'match_loser')
			.select([
				'match_winner.displayName AS winner',
				'match_loser.displayName AS loser',
				'match.score_winner AS score_winner',
				'match.score_loser AS score_loser'
			])
			.where('match_winner.id = :user_id')
			.orWhere('match_loser.id = :user_id')
			.setParameter('user_id', userId)
			.orderBy('match.id', 'DESC')
			.execute()
	}

	async getChannelUserInfo(channel_id: number, channel_name: string): Promise<ReturnChannel> {
		let users: UserIdentity[] = await this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.channels', 'user_channels')
			.select([
				'user.id AS id',
				'user.login AS login',
				'user.displayName AS display_name'
			])
			.where('user_channels.id = :id', {id: channel_id})
			.getRawMany()
		let channel: ReturnChannel = new ReturnChannel();
		channel.channel_id = channel_id;
		channel.name = channel_name;
		channel.users = users;
		return channel;
	}

	async getChannelsByUserId(user_id: number): Promise<ReturnChannel[]> {
		let channels: {channel_id: number, name: string, type: ChannelStatus}[] = await this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.channels', 'channel')
			.select([
				'channel.id AS channel_id',
				'channel.name AS name',
				'channel.type AS type'
			])
			.where('user.id = :user_id', {user_id: user_id})
			.orderBy('channel.last_update', 'DESC')
			.getRawMany()

		let ret_channels: ReturnChannel[] = new Array<ReturnChannel>();

		for (const chan of channels) {
			ret_channels.push({
				...await this.getChannelUserInfo(chan.channel_id, chan.name),
				type: chan.type,
			})
		}

		return ret_channels;
	}

	getMatchByUserLogin(login: string): Promise<ReturnMatch[]> {
		return this.matchRepository
			.createQueryBuilder('match')
			.leftJoin('match.winner', 'match_winner')
			.leftJoin('match.loser', 'match_loser')
			.select([
				'match_winner.displayName AS winner',
				'match_loser.displayName AS loser',
				'match.score_winner AS score_winner',
				'match.score_loser AS score_loser'
			])
			.where('match_winner.login = :login')
			.orWhere('match_loser.login = :login')
			.setParameter('login', login)
			.orderBy('match.id', 'DESC')
			.getRawMany()
	}

	async getFriendsByUserID(id: number): Promise<ReturnUser[]> {
		return await this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.following', 'user_following', "user.id = :id", {id})
			.select([
				'user_following.id AS id',
				'user_following.login AS login',
				'user_following.displayName AS displayName',
				'user_following.picture AS picture',
				'user_following.state AS state',
				'user_following.current_game AS current_game'
			])
			.getRawMany()
	}

	async getNotFriendsByUserID(id: number): Promise<ReturnUser[]> {
		return await this.userRepository
			.createQueryBuilder('user')
			.select([
				'user.id AS id',
				'user.login AS login',
				'user.displayName AS displayName',
				'user.picture AS picture',
				'user.state AS state',
				'user.current_game AS current_game'
			])
			.where(`NOT user.id = :id AND NOT EXISTS (
				SELECT "user_following"."followed_id"
				FROM "user_following"
				WHERE "user"."id" = "user_following"."followed_id" AND "user_following"."user_id" = :id
			)`, {id})
			.getRawMany()
	}

	async getStats(login: string): Promise<Leaderboard> {
		let stats: Leaderboard = await this.leaderboardRepository
			.createQueryBuilder()
			.where('login = :login', {login})
			.getOne()
		return stats
	}

	async getAllStats(): Promise<Leaderboard[]> {
		return await this.leaderboardRepository
			.createQueryBuilder('user')
			.orderBy('user.elo', 'DESC')
			.getMany()
	}

	getFriendsByUserLogin(login: string): Promise<ReturnUser[]> {
		return this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.following', 'user_following')
			.select([
				'user_following.id AS id',
				'user_following.login AS login',
				'user_following.displayName AS displayName',
				'user_following.picture AS picture',
				'user_following.state AS state'
			])
			.where('user.login = :user_login')
			.setParameter('user_login', login)
			.getRawMany()
	}

	async findOrCreateUser(user: Profile): Promise<User> {
		let db_user = await this.userRepository
			.findOne({
				where: {
					login: user.login
				}
			});

		if (!db_user) {
			user.displayName = user.login;
			db_user = await this.userRepository.save(user);
		}
		return db_user;
	}

	async updateUser(id: number, user: PrivatePatchUserDto) {
		if (user.displayName) {
			let res = await this.userRepository.count({where: {displayName: user.displayName.toLowerCase()}})
			if (res != 0) {
				throw new UnauthorizedException('User display name is already taken');
			}
		}

		await this.userRepository
			.createQueryBuilder()
			.update()
			.set(user)
			.where('id = :id', {id})
			.execute()
	}

	async joinChannel(user: number, request: JoinChannelDto) {
		Logger.debug("joinChannel: Start");

		let chan: {type: ChannelStatus, password: string} = await this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.bans', 'user_bans')
			.leftJoin('user_bans.channel', 'user_bans_channel')
			.leftJoin('user.channels', 'user_channels')
			.select([
				'user_channels.password AS password',
				'user_channels.type AS type'
			])
			.where('user_channels.id = :channel_id \
			AND ( \
				NOT EXISTS ( \
					SELECT * FROM ban \
					WHERE \
						"ban"."userId" = :user_id \
						AND "ban"."channelId" = :channel_id \
						AND "ban"."type" = :type_ban \
						AND "ban"."ban_time" > NOW() \
				) \
			) \
			AND ( \
				user_channels.type = :public \
				OR user_channels.type = :pass \
			) \
			AND NOT EXISTS ( \
				SELECT * FROM user_channels \
				WHERE \
					user_id = :user_id \
					AND channel_id = :channel_id \
			)')
			.setParameters({
				channel_id: request.id,
				user_id: user,
				public: ChannelStatus.public,
				pass: ChannelStatus.password,
				type_ban: SanctionTypes.Ban,
			})
			.getRawOne()

		if (!chan) {
			Logger.debug('joinChannel: Cannot join channel');
			throw new UnauthorizedException('Cannot join channel');
		}
		if (chan.type == ChannelStatus.password && (!request.password || !await bcrypt.compare(request.password, chan.password))) {
			Logger.debug('joinChannel: Wrong password')
			throw new ForbiddenException('Wrong password');
		}

		await this.userRepository
			.createQueryBuilder()
			.relation('channels')
			.of(user)
			.add(request.id)

		Logger.debug("joinChannel: End");
	}

	async leaveChannel(user: number, channel: number): Promise<boolean> {
		Logger.debug('leaveChannel: Start')
		if (await this.isUserInChannel(user, channel) == 0) {
			Logger.log('leaveChannel: User not in channel');
			// return false;
			throw new UnauthorizedException('User is not in channel');
		}

		await this.userRepository
			.createQueryBuilder()
			.relation("channels")
			.of(user)
			.remove(channel)
		if (await this.isOwner(user, channel)) {
			Logger.log('leaveChannel: User was owner');
			await this.userRepository
				.createQueryBuilder()
				.relation("chanops")
				.of(user)
				.remove(channel)

			let new_owner: {id: number} | null = await this.channelRepository
				.createQueryBuilder("channel")
				.select('chanop.id', 'id')
				.leftJoin("channel.chanops", "chanop")
				.where("channel.id = :channel AND chanop.id IS NOT NULL", {channel})
				.getRawOne();

			if (!new_owner) {
				Logger.log('leaveChannel: No chanop found');
				new_owner = await  this.channelRepository
					.createQueryBuilder("channel")
					.select('user.id', 'id')
					.leftJoin("channel.users", "user")
					.where("channel.id = :channel  AND user.id IS NOT NULL", {channel})
					.getRawOne();

				if (new_owner) {
					Logger.log('leaveChannel: A user is promoted to chanop');
					await this.channelRepository
						.createQueryBuilder()
						.relation('chanops')
						.of(channel)
						.add(new_owner.id)
				}
			}

			if (new_owner) {
				Logger.log('leaveChannel: A chanop is promoted to owner');
				await this.channelRepository
					.createQueryBuilder()
					.relation("owner")
					.of(channel)
					.set(new_owner.id)
			} else {
				await this.channelRepository
				.createQueryBuilder()
				.delete()
				.where('id = :channel_id')
				.setParameter('channel_id', channel)
				.execute()
				Logger.debug('leaveChannel: No more user in channel; Deleting it.');
			}
		} else if (await this.isChanop(user, channel)) {
			await this.userRepository
				.createQueryBuilder()
				.relation("chanops")
				.of(user)
				.remove(channel)
		}
		Logger.debug('leaveChannel: End');
		return true;
	}

	async isBlocked(user_blocking: number, blocked_id: number): Promise<boolean> {
		return await this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.blocked', 'blocked_id')
			.where('user.id = :user_id AND blocked_id.id = :blocked_id')
			.setParameters({
				user_id: user_blocking,
				blocked_id: blocked_id
			})
			.getCount() != 0;
	}

	async blockUser(user_blocking: number, user_blocked: number) {
		Logger.debug("blockUser: Start");

		if (await this.isBlocked(user_blocking, user_blocked)) {
			Logger.debug("blockUser: Already blocked");
			return;
		}

		await this.userRepository
			.createQueryBuilder()
			.relation("blocked")
			.of(user_blocking)
			.add(user_blocked);

		Logger.debug("blockUser: End");
	}

	async unblockUser(user_unblocking: number, user_unblocked: number) {
		Logger.debug("unblockUser: Start");

		if (!await this.isBlocked(user_unblocking, user_unblocked)) {
			Logger.debug("unblockUser: Already not blocked");
			return;
		}

		await this.userRepository
			.createQueryBuilder()
			.relation("blocked")
			.of(user_unblocking)
			.remove(user_unblocked);

		Logger.debug("unblockUser: End");
	}

	async addToChannel(user: number, addDto: AddToChannelDto) {
		Logger.debug("addToChannel: Start");

		if (!await this.isChanop(user, addDto.channel_id)) {
			Logger.debug('addToChannel: User is not chanop')
			throw new UnauthorizedException('Couldn\'t add to channel')
		}

		if (await this.isUserInChannel(addDto.user_id, addDto.channel_id)) {
			Logger.debug('addToChannel: User is already in channel')
			throw new UnauthorizedException('User is already in channel')
		}

		let does_channel_exist = await this.channelRepository.count({where: {id: addDto.channel_id}});
		if (does_channel_exist == 0) {
			Logger.debug('addToChannel: No such channel')
			throw new NotFoundException('No such channel')
		}

		await this.userRepository
			.createQueryBuilder()
			.relation('channels')
			.of(addDto.user_id)
			.add(addDto.channel_id)


		await this.banRepository
			.createQueryBuilder('ban')
			.leftJoin('ban.user', 'user')
			.leftJoin('ban.channel', 'channel')
			.delete()
			.where('user.id = :user AND channel.id = :channel', {user: addDto.user_id, channel: addDto.channel_id})
			.execute()

		Logger.debug("addToChannel: End");
	}

	async sanctionInChannel(banner: number, sanctionDto: SanctionDto, sanction_type: SanctionTypes) {
		Logger.debug('sanctionInChannel: Start')
		let other_is_chanop: boolean = undefined;

		// If owner  -> Can sanction
		// If chanop -> If other is chanop     -> Cannot sanction
		//           -> If other is not chanop -> Can sanction
		// If user   -> Cannot sanction
		if (!await this.isOwner(banner, sanctionDto.channel_id)) {
			if (await this.isChanop(banner, sanctionDto.channel_id)) {

				if (await this.isChanop(sanctionDto.user_id, sanctionDto.channel_id)) {
					throw new UnauthorizedException('Cannot ban a chanop');
				}

				other_is_chanop = false;
			} else {
				throw new UnauthorizedException('Cannot ban as an user');
			}
		}

		let new_ban = new Ban();
		new_ban.ban_time = inXMinutes(sanctionDto.time);
		new_ban.type = sanction_type;
		new_ban = await this.banRepository.save(new_ban);
		if (sanction_type == SanctionTypes.Ban) {
			if (other_is_chanop !== false && await this.isChanop(sanctionDto.user_id, sanctionDto.channel_id)) {
				await this.userRepository
					.createQueryBuilder()
					.relation('chanops')
					.of(sanctionDto.user_id)
					.remove(sanctionDto.channel_id)
			}
			await this.userRepository
				.createQueryBuilder()
				.relation('channels')
				.of(sanctionDto.user_id)
				.remove(sanctionDto.channel_id)
		}
		await this.userRepository
			.createQueryBuilder()
			.relation('bans')
			.of(sanctionDto.user_id)
			.add(new_ban.id)
		await this.channelRepository
			.createQueryBuilder()
			.relation('bans')
			.of(sanctionDto.channel_id)
			.add(new_ban.id)

		Logger.debug('sanctionInChannel: End')
	}

	async unsanctionInChannel(unbanner: number, sanctionDto: UnsanctionDto) {
		Logger.debug("unsanctionInChannel: Start");

		if (!await this.isChanop(unbanner, sanctionDto.channel_id)) {
			Logger.debug('unsanctionInChannel: User is not chanop');
			throw new UnauthorizedException('User is not chanop');
		}

		await this.banRepository.delete({user: {id: sanctionDto.user_id}, channel: {id: sanctionDto.channel_id}})

		Logger.debug("unsanctionInChannel: End");
	}

	async promoteUser(user: number, promoDto: PromotionDto) {
		Logger.debug('promoteUser: Start')

		if (!await this.isOwner(user, promoDto.channel_id)) {
			Logger.debug('promoteUser: Cannot promote user')
			throw new UnauthorizedException('Cannot promote user');
		}
		if (await this.isChanop(promoDto.user_id, promoDto.channel_id)) {
			Logger.debug('promoteUser: Cannot promote user')
			throw new BadRequestException('User is already chanop');
		}
		await this.channelRepository
			.createQueryBuilder()
			.relation('chanops')
			.of(promoDto.channel_id)
			.add(promoDto.user_id)

		Logger.debug('promoteUser: End')
	}


	async demoteUser(user: number, promoDto: PromotionDto) {
		Logger.debug('demoteUser: Start')

		if (!await this.isOwner(user, promoDto.channel_id)) {
			Logger.debug('demoteUser: Cannot demote user')
			throw new UnauthorizedException('Cannot demote user');
		}
		if (!await this.isChanop(promoDto.user_id, promoDto.channel_id)) {
			Logger.debug('demoteUser: User is not chanop')
			throw new BadRequestException('User is not chanop');
		}
		await this.channelRepository
			.createQueryBuilder()
			.relation('chanops')
			.of(promoDto.channel_id)
			.remove(promoDto.user_id)

		Logger.debug('demoteUser: End')
	}

	async changeUserStatus(id: number, state: UserStatus, current_game?: string) {
		Logger.debug('changeUserStatus: Start')
		await this.userRepository
			.createQueryBuilder("user")
			.update()
			.set({ state, current_game })
			.where('"user"."id" = :id', {id})
			.execute()
		Logger.debug('changeUserStatus: End')
	}

	async setGame(id_1: number, id_2: number, game_id: string) {
		Logger.debug('setGame: Start')
		await this.userRepository
			.createQueryBuilder("user")
			.update()
			.set({ state: UserStatus.in_game, current_game: game_id })
			.where('"user"."id" = :id_1 OR "user"."id" = :id_2', {id_1, id_2})
			.execute()
		Logger.debug('setGame: End')
	}

	async changeUserStatusIfOnline(user: number, new_status: UserStatus): Promise<number> {
		Logger.debug('changeUserStatus: Start')
		let ret = await this.userRepository
			.createQueryBuilder()
			.update()
			.set({ state: new_status })
			.where("id = :user_id AND NOT state = :offline")
			.setParameter('user_id', user)
			.setParameter('offline', UserStatus.offline)
			.execute()
		Logger.debug('changeUserStatus: End')
		return ret.affected
	}

	async addFriend(user_id: number, friend_id: number) {
		Logger.debug('addFriend: Start')
		if (!await this.exists(friend_id)) {
			Logger.debug('addFriend: User don\'t exist')
			throw new NotFoundException('User doesn\'t exist')
		}

		let are_already_friend = await this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.following', 'friend')
			.where('user.id = :id AND friend.id = :friend_id')
			.setParameters({
				id: user_id,
				friend_id: friend_id
			})
			.getCount()

		if (are_already_friend) {
			Logger.debug('addFriend: Already friends')
			throw new UnauthorizedException('User are already friends');
		}

		await this.userRepository
			.createQueryBuilder()
			.relation('following')
			.of(user_id)
			.add(friend_id)
		Logger.debug('addFriend: End')
	}

	async removeFriend(user_id: number, friend_id: number) {
		Logger.debug('removeFriend: Start')
		let are_already_friend = await this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.following', 'friend')
			.where('user.id = :id AND friend.id = :friend_id')
			.setParameters({
				id: user_id,
				friend_id: friend_id
			})
			.getCount()

		if (!are_already_friend) {
			Logger.debug('removeFriend: Not already friends')
			throw new UnauthorizedException('User are not already friends');
		}

		await this.userRepository
			.createQueryBuilder()
			.relation('following')
			.of(user_id)
			.remove(friend_id)
		Logger.debug('removeFriend: End')
	}


	async canSendMessage(user_id: number, channel_id: number): Promise<boolean> {
		let user_in_channel = await this.userRepository
			.createQueryBuilder("user")
			.leftJoin('user.channels', 'channel')
			.where('user.id = :user_id AND channel.id = :channel_id', {user_id, channel_id})
			.getCount();

		if (user_in_channel == 0) {
			return (false);
		}

		return await this.banRepository
			.createQueryBuilder('ban')
			.where('ban.userId = :user_id AND ban.channelId = :channel_id AND ban.ban_time > NOW()', {user_id, channel_id})
			.getCount() == 0;
	}

	async sendInvite(id: number, display_name: string, received_message: InviteDto): Promise<ServerInvite> {
		Logger.debug('sendInvite: Start')

		if (!await this.canSendMessage(id, received_message.room)) {
			Logger.debug('sendInvite: Cannot send message');
			throw new UnauthorizedException('Cannot send message');
		}
		let message = new Message();
		message.content = "";
		message.is_pong_invite = true;
		message.game_id = crypto.randomUUID();
		let new_message = await this.messageRepository.save(message)

		await this.channelRepository
			.createQueryBuilder()
			.relation('messages')
			.of(received_message.room)
			.add(new_message.id)
		await this.userRepository
			.createQueryBuilder()
			.relation('messages')
			.of(id)
			.add(new_message.id)

		let socket_message: ServerInvite = {
			sender_id: id,
			sender_display_name: display_name,
			queue_uuid: message.game_id,
			room: received_message.room,
		}
		Logger.debug('sendInvite: End');
		return socket_message;
	}

	async sendMessage(id: number, received_message: MessageDto): Promise<ServerMessage> {
		Logger.debug('Send Message: Start')
		if (!await this.canSendMessage(id, received_message.room)) {
			Logger.debug('Send Message: Cannot send message');
			throw new UnauthorizedException('Cannot send message');
		}
		let message = new Message();
		message.content = received_message.content;
		message.is_pong_invite = false;
		message.game_id = received_message.game_id;
		let new_message = await this.messageRepository.save(message)
		let db_user: {displayName: string, picture: string, login: string} = await this.userRepository.findOne({select: {picture: true, displayName: true, login: true}, where: {id}});

		await this.channelRepository
			.createQueryBuilder()
			.relation('messages')
			.of(received_message.room)
			.add(new_message.id)
		await this.userRepository
			.createQueryBuilder()
			.relation('messages')
			.of(id)
			.add(new_message.id)

		let socket_message: ServerMessage = {
			sender_id: id,
			sender_display_name: db_user.displayName,
			sender_picture_link: db_user.picture,
			sender_login: db_user.login,
			content: received_message.content,
			room: received_message.room,
			timestamp: new Date() }
		Logger.debug('Send Message: End');
		return socket_message;
	}

	// @deprecated
    async getUserById(id: number): Promise<ReturnUser> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

	// @deprecated
    async getUserByLogin(other_login: string, user_id?: number): Promise<ReturnUser & {is_blocked: boolean}> {
        const user = await this.userRepository.findOne({ where: { login: other_login } });
        if (!user) {
            throw new NotFoundException(`User with login ${other_login} not found`);
        }

		if (user_id) {
			const is_blocked = await this.userRepository
				.createQueryBuilder('user')
				.leftJoin('user.blocked', 'blocked')
				.where('user.id = :id AND blocked.login = :blocked', {id: user_id, blocked: other_login})
				.getCount()
			return {...user, is_blocked: is_blocked != 0};
		}
		return {...user, is_blocked: false};
    }

	// @deprecated
	async updateUserByLogin(login: string, updateUserDto: PatchUserDto): Promise<void> {
        const user = await this.userRepository.findOne({ where: { login : login} });
        Object.keys(updateUserDto).forEach(key => {
            if (updateUserDto[key] !== undefined) {
                user[key] = updateUserDto[key];
            }
        });
        await this.userRepository.save(user);
    }

	async addProfilePic(login: string, filename: string) {
        return this.userRepository.update({ login }, { picture: filename });
    }

	@Cron('* 0 * * *')
	async clearBans() {
		await this.banRepository
			.createQueryBuilder()
			.delete()
			.where('ban_time < NOW()')
			.execute()
	}
}
