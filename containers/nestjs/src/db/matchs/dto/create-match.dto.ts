import { EloWinStatus } from "src/utils/calculate_elo";
import { Score } from "../model/score.model";

export class CreateMatchDto {
	p1: Score;
	p2: Score;
	status: EloWinStatus;
}
