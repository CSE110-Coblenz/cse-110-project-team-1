import { Species } from 'src/common/types/Species';
import { EntityModel } from './EntityModel';

export class PlayerModel extends EntityModel {
	experience: number = 0;

	constructor(
		species: Species = Species.MOUSE,
		x: number = 0,
		y: number = 0,
		speed_boost: boolean = false,
		experience: number = 0,
	) {
		super(species, x, y, speed_boost);
		this.experience = experience;
	}

	public getExperience(): number {
		return this.experience;
	}

	public setExperience(exp: number): void {
		this.experience = exp;
	}
}
