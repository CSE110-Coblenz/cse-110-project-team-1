import Konva from 'konva';
import type { Group } from 'konva/lib/Group';
import type { View } from '../../types';

/**
 * GameScreenView: draws the main game background and a simple HUD with
 * a health bar and a progress bar. Exposes `setHealth` and `setProgress`
 * so controllers or external systems can update the HUD from the PlayerModel.
 */
export class GameScreenView implements View {
	private group: Group;

	// HUD elements
	private healthBg: Konva.Rect;
	private healthFill: Konva.Rect;
	private healthLabel: Konva.Text;

	private progressBg: Konva.Rect;
	private progressFill: Konva.Rect;
	private progressLabel: Konva.Text;

	// layout constants
	private hudX = 20;
	private hudY = 20;
	private barW = 220;
	private barH = 18;

	constructor() {
		this.group = new Konva.Group();

		const background = new Konva.Rect({
			x: 0,
			y: 0,
			width: 800,
			height: 600,
			fill: '#002b36',
			opacity: 0.9,
		});

		const label = new Konva.Text({
			x: 120,
			y: 120,
			text: 'Game Screen',
			fontSize: 36,
			fill: '#ffffff',
		});

		// Health bar
		this.healthBg = new Konva.Rect({
			x: this.hudX,
			y: this.hudY,
			width: this.barW,
			height: this.barH,
			fill: '#333',
			cornerRadius: 6,
		});

		this.healthFill = new Konva.Rect({
			x: this.hudX,
			y: this.hudY,
			width: this.barW,
			height: this.barH,
			fill: '#e53935',
			cornerRadius: 6,
		});

		this.healthLabel = new Konva.Text({
			x: this.hudX + 8,
			y: this.hudY - 2,
			text: `HP: 100%`,
			fontSize: 12,
			fill: '#ffffff',
		});

		// Progress bar (below health)
		const progressY = this.hudY + this.barH + 12;
		this.progressBg = new Konva.Rect({
			x: this.hudX,
			y: progressY,
			width: this.barW,
			height: 12,
			fill: '#333',
			cornerRadius: 6,
		});

		this.progressFill = new Konva.Rect({
			x: this.hudX,
			y: progressY,
			width: 0,
			height: 12,
			fill: '#1e88e5',
			cornerRadius: 6,
		});

		this.progressLabel = new Konva.Text({
			x: this.hudX + 8,
			y: progressY - 2,
			text: `Progress: 0%`,
			fontSize: 12,
			fill: '#ffffff',
		});

		this.group.add(background);
		this.group.add(label);

		this.group.add(this.healthBg);
		this.group.add(this.healthFill);
		this.group.add(this.healthLabel);

		this.group.add(this.progressBg);
		this.group.add(this.progressFill);
		this.group.add(this.progressLabel);

		// initialize
		this.setHealth(100);
		this.setProgress(0);
	}

	getGroup(): Group {
		return this.group;
	}

	show(): void {
		this.group.visible(true);
	}

	hide(): void {
		this.group.visible(false);
	}

	/** Set health as percentage 0..100 */
	setHealth(pct: number): void {
		const clamped = Math.max(0, Math.min(100, Math.round(pct)));
		const w = (clamped / 100) * this.barW;
		this.healthFill.width(w);
		this.healthLabel.text(`HP: ${clamped}%`);
	}

	/** Set progress as percentage 0..100 */
	setProgress(pct: number): void {
		const clamped = Math.max(0, Math.min(100, Math.round(pct)));
		const w = (clamped / 100) * this.barW;
		this.progressFill.width(w);
		this.progressLabel.text(`Progress: ${clamped}%`);
	}
}

export default GameScreenView;
