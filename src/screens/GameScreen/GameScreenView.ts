// src/views/GameScreenView.ts
// src/views/GameScreenView.ts
import Konva from 'konva';
import type { Group } from 'konva/lib/Group';
import type { View } from 'src/types';
/**
 * GameScreenView: draws the main game HUD (health + progress).
 * Provides `setHealth` and `setProgress` for external updates.
 *
 * The HUD auto-resizes with the screen.
 * GameScreenView: draws the main game HUD (health + progress).
 * Provides `setHealth` and `setProgress` for external updates.
 *
 */
export class GameScreenView implements View {
	private group: Group;

	// HUD background panel (semi-transparent)
	private hudPanel: Konva.Rect;

	// HUD elements
	private healthBg: Konva.Rect;
	private healthFill: Konva.Rect;
	private healthLabel: Konva.Text;

	private progressBg: Konva.Rect;
	private progressFill: Konva.Rect;
	private progressLabel: Konva.Text;

	// dynamic layout fields (updated on resize)
	private stageWidth: number;
	private stageHeight: number;

	private hudX = 20;
	private hudY = 20;
	private barW = 220;
	private barH = 18;

	// panel paddings (around HUD content)
	private panelPadX = 10;
	private panelPadY = 8;

	// keep current values so layout can reapply them
	private currentHealth = 100;
	private currentProgress = 0;

	constructor(stageWidth = 800, stageHeight = 600) {
		this.group = new Konva.Group({
			zIndex: 999, // ensure HUD group is on top of game layers
			listening: false, // panel/HUD are visual only
		});

		this.stageWidth = stageWidth;
		this.stageHeight = stageHeight;

		// create HUD panel first so it stays behind other nodes
		this.hudPanel = new Konva.Rect({
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			cornerRadius: 10,
			fill: 'black',
			opacity: 0.35, // transparent look
			listening: false, // avoid intercepting events
		});

		// HUD shapes; sizes are placeholder, resize() will update
		this.healthBg = new Konva.Rect({
			x: 0,
			y: 0,
			width: 200,
			height: 30,
			fill: '#000000',
			cornerRadius: 6,
		});
		this.healthFill = new Konva.Rect({
			x: 0,
			y: 0,
			width: 200,
			height: 30,
			fill: '#ff0000',
			cornerRadius: 6,
		});
		this.healthLabel = new Konva.Text({
			x: 0,
			y: 0,
			text: `HP: 100%`,
			fontSize: 12,
			fill: '#ffffff',
			fontStyle: 'bold',
		});

		this.progressBg = new Konva.Rect({
			x: 0,
			y: 0,
			width: 10,
			height: 10,
			fill: '#333',
			cornerRadius: 6,
		});
		this.progressFill = new Konva.Rect({
			x: 0,
			y: 0,
			width: 0,
			height: 10,
			fill: '#1e88e5',
			cornerRadius: 6,
		});
		this.progressLabel = new Konva.Text({
			x: 0,
			y: 0,
			text: `Progress: 0%`,
			fontSize: 10,
			fill: '#ffffff',
		});

		// add to group (panel first => behind)
		this.group.add(this.hudPanel);

		this.group.add(this.healthBg);
		this.group.add(this.healthFill);
		this.group.add(this.healthLabel);

		this.group.add(this.progressBg);
		this.group.add(this.progressFill);
		this.group.add(this.progressLabel);

		// compute initial layout using the provided stage size
		this.resize(this.stageWidth, this.stageHeight);
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

	/** Recompute HUD layout for a given stage width/height. */
	resize(stageWidth: number, stageHeight: number): void {
		this.stageWidth = stageWidth;
		this.stageHeight = stageHeight;

		// responsive sizing
		const margin = Math.max(12, Math.round(this.stageWidth * 0.02));
		this.hudX = margin;
		this.hudY = margin;
		this.barW = Math.max(120, Math.min(360, Math.round(this.stageWidth * 0.22)));
		this.barH = Math.max(12, Math.round(this.stageHeight * 0.025));


		this.panelPadX = Math.max(8, Math.round(this.barH * 0.6));
		this.panelPadY = Math.max(6, Math.round(this.barH * 0.45));

		// position health
		this.healthBg.x(this.hudX);
		this.healthBg.y(this.hudY);
		this.healthBg.width(this.barW);
		this.healthBg.height(this.barH);

		this.healthFill.x(this.hudX);
		this.healthFill.y(this.hudY);
		this.healthFill.height(this.barH);
		const healthW = (Math.max(0, Math.min(100, this.currentHealth)) / 100) * this.barW;
		this.healthFill.width(healthW);

		// labels above bars by a tiny offset
		const labelOffsetY = Math.round(this.barH * -0.02);
		this.healthLabel.fontSize(Math.max(12, Math.round(this.barH * 0.8)));
		this.healthLabel.x(this.hudX + 8);
		this.healthLabel.y(this.hudY + labelOffsetY);

		// progress below health
		const progressY = this.hudY + this.barH + Math.round(this.barH * 0.6);
		const progressH = Math.max(10, Math.round(this.barH * 0.75));

		const labelOffsetProgressY = Math.round (this.barH * -0.01);
		this.progressBg.x(this.hudX);
		this.progressBg.y(progressY + labelOffsetY);
		this.progressBg.width(this.barW);
		this.progressBg.height(progressH);

		this.progressFill.x(this.hudX);
		this.progressFill.y(progressY);
		this.progressFill.height(progressH);
		const progressW = (Math.max(0, Math.min(100, this.currentProgress)) / 100) * this.barW;
		this.progressFill.width(progressW);

		this.progressLabel.fontSize(Math.max(10, Math.round(this.barH * 0.65)));
		this.progressLabel.x(this.hudX + 8);
		this.progressLabel.y(progressY + Math.round(progressH * -0.15));

		// compute panel bounds to wrap HUD
		const left = this.hudX - this.panelPadX;
		const top = this.hudY - this.panelPadY;
		const right = this.hudX + this.barW + this.panelPadX;
		const bottom = progressY + progressH + this.panelPadY;

		this.hudPanel.x(left);
		this.hudPanel.y(top);
		this.hudPanel.width(right - left);
		this.hudPanel.height(bottom - top);
		this.hudPanel.cornerRadius(
			Math.round(Math.min(this.hudPanel.width(), this.hudPanel.height()) * 0.07),
		);
	}

	/** Set health as percentage 0..100 */
	setHealth(pct: number): void {
		const clamped = Math.max(0, Math.min(100, Math.round(pct)));
		this.currentHealth = clamped;
		const w = (clamped / 100) * this.barW;
		this.healthFill.width(w);
		this.healthLabel.text(`HP: ${clamped}%`);
	}

	/** Set progress as percentage 0..100 */
	setProgress(pct: number): void {
		const clamped = Math.max(0, Math.min(100, Math.round(pct)));
		this.currentProgress = clamped;
		const w = (clamped / 100) * this.barW;
		this.progressFill.width(w);
		this.progressLabel.text(`Progress: ${clamped}%`);
	}
}

export default GameScreenView;
