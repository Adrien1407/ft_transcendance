export function inXMinutes(nb_min: number): Date {
	let ban_end = new Date();
	ban_end.setMinutes(ban_end.getMinutes() + nb_min)
	return ban_end
}
