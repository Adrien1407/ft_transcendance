import { Score } from "src/db/matchs/model/score.model";
import { EloWinStatus } from "src/utils/calculate_elo";

export class MatchOutput {
	p1: Score;
	p2: Score;
	output: EloWinStatus;
}
