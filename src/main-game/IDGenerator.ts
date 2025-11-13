export class IDGenerator {
	private static usedIds: Set<string> = new Set();
	private static characters: string =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	private static id_length: number = 8; // default length

	private static generateHash(): string {
		let hash = '';
		for (let i = 0; i < this.id_length; i++) {
			const index = Math.floor(Math.random() * this.characters.length);
			hash += this.characters[index];
		}
		return hash;
	}

	public static createUniqueHash(): string {
		let hash = this.generateHash();
		while (this.usedIds.has(hash)) {
			hash = this.generateHash();
		}
		this.usedIds.add(hash);
		return hash;
	}
}
