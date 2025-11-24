import { Species } from 'src/common/types/Species';
import { EntityModel } from 'src/main-game/EntityModel';

export class PlayerModel extends EntityModel {
	experience: number = 0;

	constructor(
		species: Species = Species.MOUSE,
		x: number = 0,
		y: number = 0,
		experience: number = 0,
	) {
		super(species, x, y, true);
		this.experience = experience;
	}

	//primarily for testing
	public setSpeed(newSpeed: number): void {
		this.speed = newSpeed;
	}

	public getExperience(): number {
		return this.experience;
	}

	public addExperience(exp: number): void {
		this.experience += exp;
	}

	public setExperience(exp: number): void {
		this.experience = exp;
	}

	public tryAttack(prey_model: EntityModel): void {
		if (this.attackCooldown <= 0) {
			this.attackCooldown = this.attackCooldownMax;
			if (prey_model.takeDamage(this.damage)) {
				this.addExperience(50);
			}
		}
	}
}
