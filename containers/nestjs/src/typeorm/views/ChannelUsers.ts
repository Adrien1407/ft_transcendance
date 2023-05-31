import { UserStatus } from "src/chat_socket/enum/user.status";
import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
	expression: `
		SELECT	DISTINCT("channel"."id") AS "channel_id",
				"user"."id" AS "id",
				"user"."login" AS "login",
				"user"."displayName" AS "displayName",
				"user"."picture" AS "picture"
		FROM "channel"
		LEFT JOIN "user_channels" ON "channel"."id" = "user_channels"."channel_id"
		LEFT JOIN "user" ON "user_channels"."user_id" = "user"."id"
	`
})
export class ChannelUsers {
	@ViewColumn()
	id: number[];

	@ViewColumn()
	login: string[];

	@ViewColumn()
	displayName: string[];

	@ViewColumn()
	picture: string[];

	@ViewColumn()
	channel_id: number;
}
