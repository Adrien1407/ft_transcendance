import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Match } from "src/typeorm/entities/Match";
import { User } from "src/typeorm/entities/User";
import { calculateElo, EloWinStatus } from "src/utils/calculate_elo";
import { Repository } from "typeorm";
import { Score } from "../model/score.model";

@Injectable()
export class MatchService {
	@InjectRepository(Match)
	private matchRepository: Repository<Match>;
	@InjectRepository(User)
	private userRepository: Repository<User>;

	async archiveMatch(p1: Score, p2: Score) {


		let winner: Score;
		let loser: Score;
		if (p1.score > p2.score) {
			winner = p1;
			loser = p2
		} else {
			winner = p2;
			loser = p1;
		}
		let tmp_match = new Match()
		tmp_match.score_loser = loser.score;
		tmp_match.score_winner = winner.score
		let match = await this.matchRepository.save(tmp_match)

		await this.userRepository
			.createQueryBuilder()
			.relation('wins')
			.of(winner.id)
			.add(match)
		await this.userRepository
			.createQueryBuilder()
			.relation('losses')
			.of(loser.id)
			.add(match);

		let p1_query = this.userRepository
			.createQueryBuilder()
			.update()
			.where('id = :user_id', {user_id: p1.id})
		let p2_query = this.userRepository
			.createQueryBuilder()
			.update()
			.where('id = :user_id', {user_id: p2.id});

		if (p1 == winner) {
			p1_query
				.set({elo: p1.elo, win_number: () => "win_number + 1"})
				.execute();
			p2_query
				.set({elo: p2.elo, loss_number: () => "loss_number + 1"})
				.execute()
		} else {
			p1_query
				.set({elo: p1.elo, loss_number: () => "loss_number + 1"})
				.execute()
			p2_query
				.set({elo: p2.elo, win_number: () => "win_number + 1"})
				.execute();
		}


	}
}
