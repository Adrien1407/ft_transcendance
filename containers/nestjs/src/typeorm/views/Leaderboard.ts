import { Index, ViewColumn, ViewEntity } from "typeorm";
import { User } from "../entities/User";

@ViewEntity({
	expression: `
		SELECT	"user"."login" AS "login",
				"user"."displayName" AS "display_name",
				"user"."elo" AS "elo",
				"user"."win_number" AS "number_of_win",
				"user"."loss_number" AS "number_of_lose",
				RANK() OVER(ORDER BY elo DESC, win_number + loss_number DESC) AS "leaderboard_rank"
		FROM "user"
	`
})
export class Leaderboard {
	@ViewColumn()
	@Index()
	login: string;

	@ViewColumn()
	display_name: string;

	@ViewColumn()
	elo: number;

	@ViewColumn()
	number_of_win: number;

	@ViewColumn()
	number_of_lose: number;

	@ViewColumn()
	leaderboard_rank: number;
}
