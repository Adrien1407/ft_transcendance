export class EloResult {
	p1_elo: number;
	p2_elo: number;
}

export enum EloWinStatus {
	lose = 0,
	win = 1,
	none = 2,
}

export function calculateElo(p1_elo: number, p2_elo: number, result: EloWinStatus) {
	const expected_score_p1 = 1 / (1 + Math.pow(10, (p2_elo - p1_elo) / 400))
	const expected_score_p2 = 1 - expected_score_p1;
	let opponent_result = result == EloWinStatus.win ? EloWinStatus.lose : EloWinStatus.win;
	return {
		p1_elo: Math.round(p1_elo + 20 * (result - expected_score_p1)),
		p2_elo: Math.round(p2_elo + 20 * (opponent_result - expected_score_p2)),
	}
}
