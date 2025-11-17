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
	public predator: EntityModel | null;
	public prey: EntityModel | null;
	protected damage: number;
	protected species: Species;
	protected id: string;

	private got_attacked: boolean = false;
	private swelling_down: boolean = false;

	private static FLASH_SPEED: number = 15;

	public attackRange = 5;
	private attackCooldown = 0;
	private attackCooldownMax = 1; // seconds between attacks

	private base_view_radius: number;
	private flash_view_radius: number;

	private base_color: string;
	private flash_color: string;

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
		this.base_color = this.color;
		this.flash_color = this.makeFlashColor(this.base_color, 0.5); // red-tinted;
		this.view_radius = attrs!.view_radius;
		this.base_view_radius = this.view_radius;
		this.flash_view_radius = this.view_radius * 1.5;
		this.direction = Direction.Up;
		this.id = IDGenerator.createUniqueHash();
		this.predator = null;
		this.prey = null;
	}

	private makeFlashColor(baseHex: string, intensity = 0.5) {
		const [r, g, b] = this.colorUtils.hexToRgb(baseHex);
		return this.colorUtils.rgbToHex(
			r + (255 - r) * intensity,
			g * (1 - intensity),
			b * (1 - intensity),
		);
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

	public colorUtils = {
		hexToRgb: (hex: string): [number, number, number] => [
			parseInt(hex.slice(1, 3), 16),
			parseInt(hex.slice(3, 5), 16),
			parseInt(hex.slice(5, 7), 16),
		],
		rgbToHex: (r: number, g: number, b: number) =>
			`#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`,
	};

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

	public setColorAndRadius(deltaSec: number) {
		if (this.got_attacked || this.swelling_down) {
			const goal = this.got_attacked ? this.flash_view_radius : this.base_view_radius;
			this.view_radius += (goal - this.view_radius) * deltaSec * EntityModel.FLASH_SPEED;

			if (Math.abs(goal - this.view_radius) < 0.5) {
				if (this.got_attacked) {
					this.got_attacked = false;
					this.swelling_down = true;
				} else if (this.swelling_down) {
					this.swelling_down = false;
				}
			}
		}

		const goalColor = this.got_attacked ? this.flash_color : this.base_color;
		const [rCurr, gCurr, bCurr] = this.colorUtils.hexToRgb(this.color);
		const [rGoal, gGoal, bGoal] = this.colorUtils.hexToRgb(goalColor);
		const r = rCurr + (rGoal - rCurr) * deltaSec * 30;
		const g = gCurr + (gGoal - gCurr) * deltaSec * 30;
		const b = bCurr + (bGoal - bCurr) * deltaSec * 30;

		this.color = this.colorUtils.rgbToHex(r, g, b);
	}

	public takeDamage(damage: number): void {
		this.got_attacked = true;
		this.health -= damage;
		if (this.health < 0) this.die();
	}

	public update(mapModel: MapModel, deltaSec: number): void {
		this.setColorAndRadius(deltaSec);
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
