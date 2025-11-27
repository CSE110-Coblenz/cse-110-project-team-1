import { Position, Direction } from 'src/main-game/types';
import { Species, SpeciesAttributesMap, SpeciesRelations } from 'src/common/types/Species';
import { IDGenerator } from 'src/main-game/IDGenerator';
import { MapModel } from 'src/main-game/MapModel';
import { EventEmitter } from 'src/main-game/types';

export class EntityModel {
	protected direction: Direction;
	protected pos: Position;
	public view_radius: number;
	protected speed: number;
	protected health: number;
	protected color: string;
	public predator: EntityModel | null;
	public prey: EntityModel | null;
	protected damage: number;
	protected species: Species;
	protected id: string;
	private events = new EventEmitter();

	protected got_attacked: boolean = false;
	protected swelling_down: boolean = false;

	protected attackRange = 15;
	protected attackCooldown = 0;
	protected attackCooldownMax = 1; // seconds between attacks

	protected base_view_radius: number;
	private swell_view_radius: number;
	protected goal_view_radius: number;

	public redTint = 0;
	public FLASH_SPEED = 10;

	constructor(
		species: Species = Species.MOUSE,
		x: number = 0,
		y: number = 0,
		speed_boost: boolean = false,
	) {
		const attrs = SpeciesAttributesMap.get(species) ?? SpeciesAttributesMap.get(Species.MOUSE)!;
		this.pos = { x, y };
		this.species = species;
		this.speed = attrs.speed;
		if (speed_boost) {
			this.speed = this.speed * 3;
		}
		this.health = attrs.health;
		this.damage = attrs.damage;
		this.color = attrs.color;
		this.view_radius = 15;
		this.goal_view_radius = this.view_radius;
		this.base_view_radius = this.view_radius;
		this.swell_view_radius = this.view_radius * 1.25;
		this.direction = Direction.Up;
		this.id = IDGenerator.createUniqueHash();
		this.predator = null;
		this.prey = null;
	}

	public onDead(fn: () => void) {
		this.events.on('dead', fn);
	}

	public die(): boolean {
		this.events.emit('dead');
		return true;
	}

	public getID(): string {
		return this.id;
	}

	public getAttackRange(): number {
		return this.attackRange;
	}

	public getPosition(): Position {
		return { ...this.pos };
	}

	public setDamage(damage: number): void {
		this.damage = damage;
	}

	public getSpeed(): number {
		return this.speed;
	}

	public getDamage(): number {
		return this.damage;
	}

	public getHealth(): number {
		return this.health;
	}

	public resetAttackCooldown(): void {
		this.attackCooldown = 0;
	}

	public getSpecies(): Species {
		return this.species;
	}

	public setHealth(health: number) {
		this.health = health;
	}

	public setPosition(x: number, y: number) {
		this.pos.x = x;
		this.pos.y = y;
	}

	public moveBy(dx: number, dy: number) {
		this.pos.x += dx;
		this.pos.y += dy;
	}

	public getDirection(): number {
		return this.direction;
	}

	public setDirection(direction: Direction) {
		this.direction = direction;
	}

	public isAlive(): boolean {
		return this.health > 0;
	}

	public getViewRadius(): number {
		return this.view_radius;
	}

	protected isFree(): boolean {
		return !this.predator && !this.prey;
	}

	public clearRelations() {
		if (this.prey) this.prey.predator = null;
		this.prey = null;
		if (this.predator) this.predator.prey = null;
		this.predator = null;
	}

	public tryAttack(prey_model: EntityModel): void {
		if (this.attackCooldown <= 0 && prey_model.isAlive()) {
			this.attackCooldown = this.attackCooldownMax;
			if (prey_model.takeDamage(this.damage)) {
				this.clearRelations();
			}
		}
	}

	public isPreyOf(other_entity_model: EntityModel): boolean {
		const relations = SpeciesRelations.get(other_entity_model.species);
		if (relations!.prey.includes(this.species)) {
			return true;
		}
		return false;
	}

	public isPredatorOf(other_entity_model: EntityModel): boolean {
		const relations = SpeciesRelations.get(other_entity_model.species);
		if (!relations) {
			throw new Error();
		}
		if (relations.predators.includes(this.species)) {
			return true;
		}
		return false;
	}

	public getColor(): string {
		return this.color;
	}

	public setColorAndRadius(deltaSec: number, in_chase: boolean = false) {
		this.goal_view_radius = this.got_attacked
			? this.swell_view_radius
			: in_chase
				? this.swell_view_radius
				: this.base_view_radius;

		this.view_radius +=
			(this.goal_view_radius - this.view_radius) * deltaSec * this.FLASH_SPEED;

		if (this.got_attacked && this.view_radius >= this.swell_view_radius - 0.5) {
			this.got_attacked = false;
			this.swelling_down = true;
		} else if (this.swelling_down && this.view_radius <= this.base_view_radius + 0.5) {
			this.swelling_down = false;
		}

		const targetTint = this.got_attacked ? 1 : 0;
		this.redTint += (targetTint - this.redTint) * deltaSec * this.FLASH_SPEED;
		this.redTint = Math.max(0, Math.min(1, this.redTint));
		if (Math.abs(this.redTint) < 1e-3) this.redTint = 0;
	}

	public update(mapModel: MapModel, deltaSec: number): void {
		this.setColorAndRadius(deltaSec);
	}

	public takeDamage(damage: number): boolean {
		this.health -= damage;
		this.got_attacked = true;
		if (this.health <= 0) return this.die();
		return false;
	}

	public tryMove(map_model: MapModel, dx: number, dy: number) {
		const nx = this.pos.x + dx;
		const ny = this.pos.y + dy;
		const mapW = map_model.getWidth();
		const mapH = map_model.getHeight();
		const r = this.getViewRadius();
		// prevent moving so that the player circle goes out of world bounds
		if (nx - r < 0 || ny - r < 0 || nx + r > mapW || ny + r > mapH) return false;
		if (map_model.isPointInsideWall(Math.floor(nx), Math.floor(ny))) return false;
		this.setPosition(nx, ny);
		return true;
	}

	public updateAttackCooldown(deltaSec: number) {
		if (this.attackCooldown > 0) this.attackCooldown -= deltaSec;
	}
}
