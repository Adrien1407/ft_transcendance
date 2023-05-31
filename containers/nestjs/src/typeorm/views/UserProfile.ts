import { UserStatus } from "src/chat_socket/enum/user.status";
import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
	expression: `
		SELECT	"user"."id",
				"user"."login",
				"user"."displayName",
				"user"."picture",
				"user"."state",
				"user"."current_game",
				"user"."elo"
		FROM "user"
	`
})
export class UserProfile {
	@ViewColumn()
	id: number;

	@ViewColumn()
	login: string;

	@ViewColumn()
	displayName: string;

	@ViewColumn()
	picture: string;

	@ViewColumn()
	state: UserStatus;

	@ViewColumn()
	current_game?: string;

	@ViewColumn()
	elo: number;
}
