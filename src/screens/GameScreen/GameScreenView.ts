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

  // dynamic layout fields (updated on resize)
  private stageWidth: number;
  private stageHeight: number;

  private hudX = 20;
  private hudY = 20;
  private barW = 220;
  private barH = 18;

  // keep current values so layout can reapply them
  private currentHealth = 100;
  private currentProgress = 0;

  constructor(stageWidth = 800, stageHeight = 600) {
	this.group = new Konva.Group({
		// Force the HUD to be on top
		zIndex: 999
	});
	this.stageWidth = stageWidth;
	this.stageHeight = stageHeight;

	
	// create HUD shapes with initial placeholder sizes; layout() will update
	this.healthBg = new Konva.Rect({ x: 0, y: 0, width: 200, height: 30, fill: '#000000', cornerRadius: 6 });
	this.healthFill = new Konva.Rect({ x: 0, y: 0, width: 200, height: 30, fill: '#ff0000', cornerRadius: 6 });
	this.healthLabel = new Konva.Text({ x: 0, y: 0, text: `HP: 100%`, fontSize: 24, fill: '#ffffff', fontStyle: 'bold' });

	this.progressBg = new Konva.Rect({ x: 0, y: 0, width: 10, height: 10, fill: '#333', cornerRadius: 6 });
	this.progressFill = new Konva.Rect({ x: 0, y: 0, width: 0, height: 10, fill: '#1e88e5', cornerRadius: 6 });
	this.progressLabel = new Konva.Text({ x: 0, y: 0, text: `Progress: 0%`, fontSize: 12, fill: '#ffffff' });

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

			// compute responsive sizes: margins and bar widths scale with stage size
			const margin = Math.max(12, Math.round(this.stageWidth * 0.02));
			this.hudX = margin;
			this.hudY = margin;
			this.barW = Math.max(120, Math.min(360, Math.round(this.stageWidth * 0.22)));
			this.barH = Math.max(12, Math.round(this.stageHeight * 0.025));

			// background should cover the stage (keep existing visual)
			const bg = this.group.findOne('Rect');
			if (bg && (bg as Konva.Rect).width) {
				try {
					(bg as Konva.Rect).width(this.stageWidth);
					(bg as Konva.Rect).height(this.stageHeight);
				} catch (e) {
					// ignore
				}
			}

			// position health
			this.healthBg.x(this.hudX);
			this.healthBg.y(this.hudY);
			this.healthBg.width(this.barW);
			this.healthBg.height(this.barH);

			this.healthFill.x(this.hudX);
			this.healthFill.y(this.hudY);
			this.healthFill.height(this.barH);
			// apply current health value to width
			const healthW = (Math.max(0, Math.min(100, this.currentHealth)) / 100) * this.barW;
			this.healthFill.width(healthW);

			this.healthLabel.x(this.hudX + 8);
			this.healthLabel.y(this.hudY - 2);

			// progress below health
			const progressY = this.hudY + this.barH + Math.round(this.barH * 0.6);
			this.progressBg.x(this.hudX);
			this.progressBg.y(progressY);
			this.progressBg.width(this.barW);
			this.progressBg.height(Math.max(10, Math.round(this.barH * 0.75)));

			this.progressFill.x(this.hudX);
			this.progressFill.y(progressY);
			this.progressFill.height(Math.max(10, Math.round(this.barH * 0.75)));
			const progressW = (Math.max(0, Math.min(100, this.currentProgress)) / 100) * this.barW;
			this.progressFill.width(progressW);

			this.progressLabel.x(this.hudX + 8);
			this.progressLabel.y(progressY - 2);
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
