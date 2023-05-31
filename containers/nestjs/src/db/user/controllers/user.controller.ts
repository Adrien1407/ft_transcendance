import { Body, Controller, FileTypeValidator, ForbiddenException, Get, HttpCode, HttpException, HttpStatus, Logger, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Query, UnsupportedMediaTypeException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { unlink } from "fs";
import { diskStorage } from "multer";
import { JWTGuard, JWTOtpGuard } from "src/auth/guards/jwt.guard";
import { UserInterface } from "src/chat_socket/interface/user.interface";
import { Match } from "src/typeorm/entities/Match";
import { Leaderboard } from "src/typeorm/views/Leaderboard";
import { UserProfile } from "src/typeorm/views/UserProfile";
import { editFileName, imageFileFilter } from "src/utils/file_upload_utils";
import { Jwt } from "src/utils/jwt.decorator";
import { ReturnAchievement } from "../classes/achievement.class";
import { ReturnChannel } from "../classes/channel.class";
import { ReturnMatch } from "../classes/matchs.class";
import { ReturnElo, ReturnStats } from "../classes/stats.class";
import { ReturnProfile, ReturnUser } from "../classes/user.class";
import { PatchUserDto } from "../dtos/patch-user.dto";
import { UserService } from "../services/user.service";

@Controller('user')
@UseGuards(JWTOtpGuard)
export class UserController {
	private ft: typeof import('file-type');
	constructor (private userService: UserService) {
		this.ft = null;
		eval(`import('file-type')`).then((module: typeof import('file-type')) => {
			this.ft = module;
		});
	}

	@Get()
	async getAllUsers(): Promise<ReturnProfile[]> {
		return await this.userService.getAllUsers();
	}

	@Get('stats')
	async getAllUsersStats(): Promise<Leaderboard[]> {
		return await this.userService.getAllStats();
	}

	@Get('me')
	async getUser(@Jwt('id') id: number): Promise<UserProfile> {
		return await this.userService.getUserById(id);
	}

	@Get('me/matchs')
	async getMatchs(@Jwt('id') id: number): Promise<ReturnMatch[]> {
		return await this.userService.getMatchByUserId(id);
	}

	@Get('me/friends')
	async getFriends(@Jwt('id') id: number): Promise<ReturnProfile[]> {
		return await this.userService.getFriendsByUserID(id);
	}

	@Get('me/not_friends')
	async getNotFriends(@Jwt('id') id: number): Promise<ReturnProfile[]> {
		return await this.userService.getNotFriendsByUserID(id);
	}

	@Get('me/stats')
	async getStats(@Jwt('login') login: string): Promise<ReturnStats> {
		return await this.userService.getStats(login);
	}

	@Get('me/channels')
	async getChannels(@Jwt('id') id: number): Promise<ReturnChannel[]> {
		return await this.userService.getChannelsByUserId(id);
	}

	@Get('id/:id/matchs')
	async getMatchByUserId(@Param('id', ParseIntPipe) id: number) {
		return await this.userService.getMatchByUserId(id);
	}

	@Get('id/:id/friends')
	async getFriendsByUserID(@Param('id', ParseIntPipe) id: number): Promise<ReturnProfile[]> {
		return await this.userService.getFriendsByUserID(id);
	}

	@Get('login/:login/')
	async getUserByLogin(@Jwt('id') user_id: number, @Param('login') other_login: string): Promise<ReturnProfile & {is_blocked: boolean}> {
		return await this.userService.getUserByLogin(other_login, user_id);
	}

	@Get('login/:login/stats')
	async getStatsByUserLogin(@Param('login') login: string): Promise<ReturnStats> {
		return await this.userService.getStats(login);
	}

	@Get('login/:login/matchs')
	async getMatchByUserLogin(@Param('login') login: string): Promise<ReturnMatch[]> {
		return await this.userService.getMatchByUserLogin(login);
	}

	@Get('login/:login/friends')
	async getFriendsByUserLogin(@Param('login') login: string): Promise<ReturnProfile[]> {
		return await this.userService.getFriendsByUserLogin(login);
	}

	@Post("add_friend/:id")
	async addFriend(@Param('id', ParseIntPipe) friend_login: number, @Jwt('id', ParseIntPipe) user_id: number) {
		await this.userService.addFriend(user_id, friend_login);
	}

	@Post("remove_friend/:id")
	async removeFriend(@Param('id', ParseIntPipe) friend_login: number, @Jwt('id', ParseIntPipe) user_id: number) {
		await this.userService.removeFriend(user_id, friend_login);
	}

	@Patch('me')
	@HttpCode(HttpStatus.NO_CONTENT)
	async updateUser(@Jwt('id') id: number, @Body() patchUserDto: PatchUserDto) {
		await this.userService.updateUser(id, patchUserDto);
	}

    @Patch('me/picture')
	@HttpCode(HttpStatus.NO_CONTENT)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './files',
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    async uploadFile(@Jwt('login') login: string, @UploadedFile(new ParseFilePipe({
		validators: [
			new MaxFileSizeValidator({ maxSize: 1000000 })
		]
	})) file: Express.Multer.File) {
		Logger.log("entering uploadFile");
		let path = `files/${file.filename}`;
		if (this.ft) {
			let mimetype = await this.ft.fileTypeFromFile(path);
			if (!["/jpg", "/jpeg", "/png", "/gif", "/webp"].some(mtype => mimetype.mime.includes(mtype))) {
				unlink(path, () => {});
				throw new UnsupportedMediaTypeException('Image type is not supported');
			}
			this.userService.addProfilePic(login, `${process.env.BACK_URL}/${path}`);
		}
    }
}
