export class GameScreenModel {
	private score: number = 0;

	constructor() {
		this.reset();
	}

	reset(): void {
		this.score = 0;
	}

	incrementScore(): void {
		this.score += 1;
	}

	getScore(): number {
		return this.score;
	}
}

export default GameScreenModel;
