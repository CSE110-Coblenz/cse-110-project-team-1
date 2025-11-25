import Konva from 'konva';
import type { Group } from 'konva/lib/Group';
import type { View } from 'src/types';
/**
 * GameScreenView: draws the main game HUD (health + progress + level).
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

	private levelBadgeRect: Konva.Rect;
	private levelBadgeText: Konva.Text;

	private speciesBadgeRect: Konva.Rect;
	private speciesBadgeText: Konva.Text;

	// additional badges: speed and damage
	private speedBadgeRect: Konva.Rect;
	private speedBadgeText: Konva.Text;

	private damageBadgeRect: Konva.Rect;
	private damageBadgeText: Konva.Text;

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
	private currentLevel = 1;
	private currentSpeciesText = 'Mouse'; //hard coded since i saw this in playerModel but update should handle if not that.

	// Badge config
	private badgePadX = 8;
	private badgePadY = 4;
	private badgeGap = 6;

	// new badge values
	private currentSpeed = 0;
	private currentDamage = 0;

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
			cornerRadius: 10,
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
			text: `Experience: 0%`,
			fontSize: 8,
			fill: '#ffffff',
		});

		this.levelBadgeText = new Konva.Text({
			x: 0,
			y: 0,
			text: 'Level 1',
			fontSize: 12,
			fill: '#000000ff',
			fontStyle: 'bold',
		});
		this.levelBadgeRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			cornerRadius: 8,
			fill: '#fedc00ff',
			stroke: 'rgba(255,255,255,0.25)',
			strokeWidth: 1,
			listening: false,
		});

		this.speciesBadgeText = new Konva.Text({
			x: 0,
			y: 0,
			text: '',
			fontSize: 12,
			fill: '#000000ff',
			fontStyle: 'bold',
		});
		this.speciesBadgeRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			cornerRadius: 8,
			fill: '#fedc00ff',
			stroke: 'rgba(255,255,255,0.25)',
			strokeWidth: 1,
			listening: false,
		});

		// create speed and damage badges (initially empty)
		this.speedBadgeText = new Konva.Text({
			x: 0,
			y: 0,
			text: 'SPD: 0',
			fontSize: 12,
			fill: '#000000ff',
			fontStyle: 'bold',
		});
		this.speedBadgeRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			cornerRadius: 8,
			fill: '#fedc00ff',
			stroke: 'rgba(255,255,255,0.25)',
			strokeWidth: 1,
			listening: false,
		});

		this.damageBadgeText = new Konva.Text({
			x: 0,
			y: 0,
			text: 'DMG: 0',
			fontSize: 12,
			fill: '#000000ff',
			fontStyle: 'bold',
		});
		this.damageBadgeRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			cornerRadius: 8,
			fill: '#fedc00ff',
			stroke: 'rgba(255,255,255,0.25)',
			strokeWidth: 1,
			listening: false,
		});

		// add to group (panel first)
		this.group.add(this.hudPanel);

		this.group.add(this.levelBadgeRect);
		this.group.add(this.levelBadgeText);

		this.group.add(this.speciesBadgeRect);
		this.group.add(this.speciesBadgeText);

		this.group.add(this.healthBg);
		this.group.add(this.healthFill);
		this.group.add(this.healthLabel);

		this.group.add(this.progressBg);
		this.group.add(this.progressFill);
		this.group.add(this.progressLabel);

		this.group.add(this.levelBadgeRect);
		this.group.add(this.levelBadgeText);

		this.group.add(this.speciesBadgeRect);
		this.group.add(this.speciesBadgeText);

		this.group.add(this.speedBadgeRect);
		this.group.add(this.speedBadgeText);

		this.group.add(this.damageBadgeRect);
		this.group.add(this.damageBadgeText);

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

		const labelOffsetY = Math.round(this.barH * -0.02);
		this.healthLabel.fontSize(Math.max(12, Math.round(this.barH * 0.8)));
		this.healthLabel.x(this.hudX + 8);
		this.healthLabel.y(this.hudY + labelOffsetY);

		// progress below health
		const progressY = this.hudY + this.barH + Math.round(this.barH * 0.6);
		const progressH = Math.max(10, Math.round(this.barH * 0.75));

		const labelOffsetProgressY = Math.round(this.barH * -0.01);
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
		this.progressLabel.y(progressY + labelOffsetProgressY);

		const badgeFont = Math.max(11, Math.round(this.barH * 0.8));
		this.levelBadgeText.fontSize(badgeFont);
		this.levelBadgeText.text(`Level ${this.currentLevel}`);

		const lvlTxtW = this.levelBadgeText.width();
		const lvlTxtH = this.levelBadgeText.height();
		const lvlW = Math.round(lvlTxtW + this.badgePadX * 2);
		const lvlH = Math.round(lvlTxtH + this.badgePadY * 2);
		const lvlX = this.hudX;
		const badgeY = progressY + progressH + this.badgeGap;

		this.levelBadgeRect.position({ x: lvlX, y: badgeY });
		this.levelBadgeRect.size({ width: lvlW, height: lvlH });
		this.levelBadgeText.position({
			x: lvlX + Math.round((lvlW - lvlTxtW) / 2),
			y: badgeY + Math.round((lvlH - lvlTxtH) / 2),
		});

		this.speciesBadgeText.fontSize(badgeFont);
		this.speciesBadgeText.text(this.currentSpeciesText);

		const spTxtW = this.speciesBadgeText.width();
		const spTxtH = this.speciesBadgeText.height();
		const spW = Math.round(spTxtW + this.badgePadX * 2);
		const spH = Math.round(spTxtH + this.badgePadY * 2);
		const spX = lvlX + lvlW + 8;

		this.speciesBadgeRect.position({ x: spX, y: badgeY });
		this.speciesBadgeRect.size({ width: spW, height: spH });
		this.speciesBadgeText.position({
			x: spX + Math.round((spW - spTxtW) / 2),
			y: badgeY + Math.round((spH - spTxtH) / 2),
		});

		// speed badge
		this.speedBadgeText.fontSize(badgeFont);
		this.speedBadgeText.text(`SPD: ${this.currentSpeed}`);
		const sdTxtW = this.speedBadgeText.width();
		const sdTxtH = this.speedBadgeText.height();
		const sdW = Math.round(sdTxtW + this.badgePadX * 2);
		const sdH = Math.round(sdTxtH + this.badgePadY * 2);
		const sdX = spX + spW + 8;

		this.speedBadgeRect.position({ x: sdX, y: badgeY });
		this.speedBadgeRect.size({ width: sdW, height: sdH });
		this.speedBadgeText.position({
			x: sdX + Math.round((sdW - sdTxtW) / 2),
			y: badgeY + Math.round((sdH - sdTxtH) / 2),
		});

		// damage badge
		this.damageBadgeText.fontSize(badgeFont);
		this.damageBadgeText.text(`DMG: ${this.currentDamage}`);
		const dmTxtW = this.damageBadgeText.width();
		const dmTxtH = this.damageBadgeText.height();
		const dmW = Math.round(dmTxtW + this.badgePadX * 2);
		const dmH = Math.round(dmTxtH + this.badgePadY * 2);
		const dmX = sdX + sdW + 8;

		this.damageBadgeRect.position({ x: dmX, y: badgeY });
		this.damageBadgeRect.size({ width: dmW, height: dmH });
		this.damageBadgeText.position({
			x: dmX + Math.round((dmW - dmTxtW) / 2),
			y: badgeY + Math.round((dmH - dmTxtH) / 2),
		});

		// compute panel bounds to fit all elements
		const left = Math.min(this.hudX, lvlX) - this.panelPadX;
		const top = this.hudY - this.panelPadY;
		const right = Math.max(this.hudX + this.barW + this.panelPadX, dmX + dmW + this.panelPadX);
		const badgesBottom = badgeY + Math.max(lvlH, spH, sdH, dmH);
		const bottom = Math.max(progressY + progressH, badgesBottom) + this.panelPadY;

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

	/** Set Experience...will change name later lol */
	setProgress(pct: number): void {
		const clamped = Math.max(0, Math.min(100, Math.round(pct)));
		this.currentProgress = clamped;
		const w = (clamped / 100) * this.barW;
		this.progressFill.width(w);
		this.progressLabel.text(`Experience: ${clamped}%`);
	}

	setLevel(level: number): void {
		this.currentLevel = Math.max(1, Math.floor(level));
		this.levelBadgeText.text(`Level ${this.currentLevel}`);
		this.resize(this.stageWidth, this.stageHeight);
	}

	setSpecies(name: string): void {
		this.currentSpeciesText = name;
		this.speciesBadgeText.text(name);
		this.resize(this.stageWidth, this.stageHeight);
	}

	setSpeed(speed: number): void {
		this.currentSpeed = Math.max(0, Math.floor(speed));
		this.speedBadgeText.text(`SPD: ${this.currentSpeed}`);
		this.resize(this.stageWidth, this.stageHeight);
	}

	setDamage(damage: number): void {
		this.currentDamage = Math.max(0, Math.floor(damage));
		this.damageBadgeText.text(`DMG: ${this.currentDamage}`);
		this.resize(this.stageWidth, this.stageHeight);
	}
}

export default GameScreenView;
