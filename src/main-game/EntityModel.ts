import { Position, Direction } from './types';
import { Species, SpeciesAttributesMap, SpeciesRelations } from '../common/types/Species';
import { IDGenerator } from './IDGenerator';

import { MapModel } from './MapModel';

export class EntityModel {
	protected direction: Direction;
	protected pos: Position;
	protected view_radius: number;
	protected speed: number;
	protected health: number;
	protected color: string;
	protected object: Konva.circle
	public predator: EntityModel | null;
	public prey: EntityModel | null;
	protected damage: number;
	protected species: Species;
	protected id: string;

	public attackRange = 5;
	private attackCooldown = 0;
	private attackCooldownMax = 1; // seconds between attacks

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
			this.speed = this.speed * 1.5;
		}
		this.health = attrs.health;
		this.damage = attrs.damage;
		this.color = attrs.color;
		this.view_radius = attrs!.view_radius;
		this.direction = Direction.Up;
		this.id = IDGenerator.createUniqueHash();
		this.predator = null;
		this.prey = null;
	}

	public getID(): string {
		return this.id;
	}

	public getPosition(): Position {
		return { ...this.pos };
	}

	public getSpeed(): number {
		return this.speed;
	}

	public getHealth(): number {
		return this.health;
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

	public getViewRadius(): number {
		return this.view_radius;
	}

	protected isFree(): boolean {
		return !this.predator && !this.prey;
	}

	public tryAttack(prey_model: EntityModel, deltaSec: number): void {
		if (this.attackCooldown <= 0) {
			prey_model.takeDamage(this.damage);
			this.attackCooldown = this.attackCooldownMax;
		}
		if (this.attackCooldown > 0) this.attackCooldown -= deltaSec;
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

	public tintRed(amt = 30): void{
		console.log("We're tinting ourselves (ID): " + this.getID() + ", red");
		const n = parseInt(this.color.slice(1), 16);
		const r = Math.min(255, (n >> 16) + amt);
		this.color = "#" + ((r << 16) | (n & 0x00FFFF)).toString(16).padStart(6, "0");
	};

	private inflate(): void{

	}

	public getKonvaObject(): Konva.circle{
		return this.object
	}

	public takeDamage(damage: number): void {
		console.log("We are taking damage");
		console.log("Our current color:" + this.getColor() + ", ID: " + this.getID());
		this.health -= damage;
		if (this.health < 0) this.die();
		this.inflate();
		this.tintRed();
	}

	public die(): void {
		return;
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
}
