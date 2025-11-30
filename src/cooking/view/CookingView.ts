import { CustomerDisplayData } from 'src/cooking/types/CustomerDisplayData';
import Konva from 'konva';
import { CookingGameConfig } from 'src/cooking/config/CookingGameConfig';

// View constants (avoid magic numbers)
const PROGRESS_BAR_WIDTH = 400;
const PROGRESS_BAR_HEIGHT = 16;
// Snappy animation for progress updates
const PROGRESS_ANIM_DURATION = 0.08; // seconds

// Gameplay stage layout
const GAME_STAGE_WIDTH = 480;
const GAME_STAGE_HEIGHT = 260;
const CUSTOMER_SIZE = 64;
const CUSTOMER_TOP_Y = 16; // top padding
const CUSTOMER_GAP = 24;
const LABEL_HEIGHT = 36;
const TRASH_SIZE = 48;
// Scale factors applied to the trash asset to make it wider and slightly taller
const TRASH_SCALE_X = 2;
const TRASH_SCALE_Y = 2.4;

export class CookingView {
	private progressStage: Konva.Stage | null = null;
	private progressBarCorrect: Konva.Rect | null = null;
	private progressBarIncorrect: Konva.Rect | null = null;
	private progressText: Konva.Text | null = null;

	// Gameplay stage (customers + draggable label + trash)
	private gameStage: Konva.Stage | null = null;
	private gameLayer: Konva.Layer | null = null;
	private customerRects: Map<string, Konva.Rect> = new Map();
	private customerPatienceTexts: Map<string, Konva.Text> = new Map();
	private customerTypeTexts: Map<string, Konva.Text> = new Map();
	private customerPatienceBarBg: Map<string, Konva.Rect> = new Map();
	private customerPatienceBarFg: Map<string, Konva.Rect> = new Map();
	private spotPositions: Array<{ x: number; y: number }> = [];
	private draggableLabelGroup: any | null = null;
	// A faint placeholder rectangle showing where the draggable label returns after drag
	private labelHomeRect: Konva.Rect | null = null;
	private trashRect: Konva.Image | Konva.Rect | null = null;
	// no separate trash text - the image now contains the label
    

	// Track current label value for event details and display
	private currentLabel: string = '';

	// Controller-provided drop handler callback
	private dropHandler: ((target: 'customer' | 'trashcan', customerId?: string) => void) | null =
		null;

	// Dynamic layout properties (computed at runtime for responsive scaling)
	private stageWidth: number = GAME_STAGE_WIDTH;
	private stageHeight: number = GAME_STAGE_HEIGHT;
	private dynCustomerSize: number = CUSTOMER_SIZE;
	private dynCustomerGap: number = CUSTOMER_GAP;
	private dynLabelHeight: number = LABEL_HEIGHT;
	private dynLabelWidth: number = 160;
	private dynTrashSize: number = TRASH_SIZE;
	private resizeHandler: (() => void) | null = null;
	private highlightedTarget: Konva.Shape | null = null;
	private baseLabelX: number = 0;
	private baseLabelY: number = 0;
	private isDraggingLabel: boolean = false;
	private measureCtx: CanvasRenderingContext2D | null = null;

	// ---- Utility helpers ----
	/** Returns client rect, falling back to x/y/width/height if getClientRect unavailable. */
	private getNodeRect(node: any): { x: number; y: number; width: number; height: number } {
		try {
			if (node.getClientRect) return node.getClientRect();
		} catch (_) {
			/* ignore */
		}
		return { x: node.x(), y: node.y(), width: node.width(), height: node.height() };
	}
	/**
	 * Recomputes dynamic layout metrics (sizes & gaps) based on the container width so the game scales.
	 * Uses guarded minimums for legibility on very small viewports.
	 */
	private computeDynamicMetrics(containerWidth: number): void {
		this.stageWidth = Math.max(320, containerWidth);
		this.stageHeight = this.computeAvailableGameStageHeight();
		// Customer avatars scale proportionally to width with a lower bound for clarity.
		this.dynCustomerSize = Math.max(48, Math.floor(this.stageWidth * 0.12));
		// Horizontal gap also scales but maintains a usable minimum.
		this.dynCustomerGap = Math.max(16, Math.floor(this.stageWidth * 0.05));
		// Label shares size with customer for consistent card appearance.
		this.dynLabelHeight = this.dynCustomerSize;
		this.dynLabelWidth = this.dynCustomerSize;
		// Trash can scales modestly to remain tappable without dominating layout.
		this.dynTrashSize = Math.max(40, Math.floor(this.stageWidth * 0.08));
	}
	/**
	 * Computes the three top customer spot coordinates centered horizontally in the current stage width.
	 */
	private computeCustomerSpotPositions(): void {
		const totalWidth = 3 * this.dynCustomerSize + 2 * this.dynCustomerGap;
		const startX = Math.max(0, Math.floor((this.stageWidth - totalWidth) / 2));
		this.spotPositions = [
			{ x: startX, y: CUSTOMER_TOP_Y },
			{ x: startX + this.dynCustomerSize + this.dynCustomerGap, y: CUSTOMER_TOP_Y },
			{ x: startX + 2 * (this.dynCustomerSize + this.dynCustomerGap), y: CUSTOMER_TOP_Y },
		];
	}
	// Track which customer is in each screen spot (0, 1, 2) for stable positioning
	// spot -> customerId (null = empty spot)
	private screenSpots: Map<number, string | null> = new Map([
		[0, null],
		[1, null],
		[2, null],
	]);

	/**
	 * Initialize the view with game data.
	 * Optionally accepts initial progress metrics so callers don't need a separate call.
	 * @param customerData Active customer display data
	 * @param label Current label/type selected by player
	 * @param score Current score value
	 * @param progress Optional initial progress counts { correct, incorrect, total }
	 */
	initialize(
		customerData: CustomerDisplayData[],
		label: string,
		score: number,
		progress?: { correct: number; incorrect: number; total: number },
	): void {
		// Initialization: build DOM scaffolding + stages

		// Get the container element
		const container = document.getElementById('container');

		if (container) {
			//basic placeholder structure
			// Only append placeholder once; keep markup simple
			if (!document.getElementById('view-placeholder')) {
				const wrapper = document.createElement('div');
				wrapper.id = 'view-placeholder';
				// Fit within the container bounds with padding and a semi-transparent light background
				wrapper.style.cssText =
					'border: none; padding: 16px; margin: 0; height: 100%; overflow: hidden; box-sizing: border-box; background-color: rgb(248, 250, 252); background-image: url("cooking-background.png"); background-size: cover; background-repeat: no-repeat; background-position: center center;';
				wrapper.innerHTML =
					'' +
					// Move score to the very top - explicitly set color for consistency
					'<div id="score-display" style="margin: 8px 0 6px; font-weight: 600; color: #111827;">Score: <span id="score-value">0</span></div>' +
					'<div id="progress-konva-container" style="margin: 6px 0 8px;"></div>' +
					'<div id="game-stage-container" style="margin: 6px 0 8px;"></div>' +
					// Hide debug text labels at the bottom while keeping them for tests
					''; // Removed test-only hidden debug elements
				container.appendChild(wrapper);
			} else {
				const wrapper = document.getElementById('view-placeholder') as HTMLDivElement;
				if (wrapper) {
					wrapper.style.cssText =
						'margin: 0; height: 100%; overflow: hidden; box-sizing: border-box; border: none; padding: 16px; background-color: rgb(248, 250, 252); background-image: url("cooking-background.png"); background-size: cover; background-repeat: no-repeat; background-position: center center;';
				}
			}

			// Create Konva progress bar
			this.createKonvaProgressBar();

			// Create gameplay stage (customers + draggable label + trash)
			this.createGameplayStage();

			// If initial progress provided, set bars now (before other textual updates)
			if (progress) {
				this.updateProgress(progress.correct, progress.incorrect, progress.total);
			}

			// Removed patience placeholder stage
			// Update initial data
			this.updateScore(score);
			this.updateLabel(label);
			this.updateCustomers(customerData);
		}
	}

	/**
	 * Creates the Konva-based progress bar
	 */
	private createKonvaProgressBar(): void {
		const konvaContainer = document.getElementById('progress-konva-container');
		if (!konvaContainer) {
			return;
		}

		this.progressStage = new Konva.Stage({
			container: 'progress-konva-container',
			width: PROGRESS_BAR_WIDTH,
			height: 40,
		});

		const layer = new Konva.Layer();

		// Progress label text
		const labelText = new Konva.Text({
			x: 0,
			y: 0,
			text: 'Progress',
			fontSize: 14,
			fill: 'black',
		});

		// Progress numeric text (e.g., "0/5 (0%)")
		this.progressText = new Konva.Text({
			x: 280,
			y: 0,
			text: '0/0 (0%)',
			fontSize: 14,
			fill: 'black',
			width: 120,
			align: 'right',
		});

		// Background bar (gray)
		const bgBar = new Konva.Rect({
			x: 0,
			y: 20,
			width: PROGRESS_BAR_WIDTH,
			height: PROGRESS_BAR_HEIGHT,
			fill: '#e5e7eb',
			cornerRadius: 8,
		});

		// Incorrect bar (red, under green)
		this.progressBarIncorrect = new Konva.Rect({
			x: 0,
			y: 20,
			width: 0,
			height: PROGRESS_BAR_HEIGHT,
			fill: '#ef4444',
			cornerRadius: 8,
		});

		// Correct progress bar (green, on top)
		this.progressBarCorrect = new Konva.Rect({
			x: 0,
			y: 20,
			width: 0,
			height: PROGRESS_BAR_HEIGHT,
			fill: '#22c55e',
			cornerRadius: 8,
		});

		layer.add(labelText);
		layer.add(this.progressText);
		layer.add(bgBar);
		layer.add(this.progressBarIncorrect);
		layer.add(this.progressBarCorrect);
		this.progressStage.add(layer);
	}

	/**
	 * Creates the gameplay stage with three customer placeholders at the top,
	 * a draggable label at the bottom, and a trash can on the bottom-right.
	 */
	private createGameplayStage(): void {
		const stageContainer = document.getElementById('game-stage-container');
		if (!stageContainer) return;

		// Compute responsive sizes using container width; fall back to window for tests
		const winW =
			typeof window !== 'undefined' && (window as any).innerWidth
				? (window as any).innerWidth
				: GAME_STAGE_WIDTH;
		const containerWidth = (stageContainer as HTMLElement).clientWidth || winW;
		this.computeDynamicMetrics(containerWidth);

		this.gameStage = new Konva.Stage({
			container: 'game-stage-container',
			width: this.stageWidth,
			height: this.stageHeight,
		});
		this.gameLayer = new Konva.Layer();

		this.computeCustomerSpotPositions();

		// Draggable label at bottom center
		const labelY = this.stageHeight - this.dynLabelHeight - 12;
		const labelWidth = this.dynLabelWidth;
		const labelX = Math.floor((this.stageWidth - labelWidth) / 2);
		this.baseLabelX = labelX;
		this.baseLabelY = labelY;

		// Create draggable label group with rect and text
		const labelRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: labelWidth,
			height: this.dynLabelHeight,
			fill: '#3b82f6',
			cornerRadius: 12,
			opacity: 1,
			stroke: '#0f172a',
			strokeWidth: 3,
		});
		const labelText = new Konva.Text({
			x: 0,
			y: 0,
			width: labelWidth,
			align: 'center',
			text: 'Drag Label',
			fontSize: Math.max(10, Math.floor(this.dynLabelHeight * 0.22)),
			fill: '#ffffff',
			wrap: 'none' as any,
		});
		// Placeholder behind the label to show the home position
		this.labelHomeRect = new Konva.Rect({
			x: labelX,
			y: labelY,
			width: labelWidth,
			height: this.dynLabelHeight,
			fill: '#0f172a',
			opacity: 0.5,
			cornerRadius: 12,
			stroke: 'black',
			strokeWidth: 2,
			listening: false,
		});
		this.gameLayer.add(this.labelHomeRect);

		this.draggableLabelGroup = new (Konva as any).Group({
			x: labelX,
			y: labelY,
			draggable: true,
		});
		this.draggableLabelGroup.add(labelRect);
		this.draggableLabelGroup.add(labelText);

		// Trash can at bottom-right
		const trashWidth = Math.floor(this.dynTrashSize * TRASH_SCALE_X);
		const trashHeight = Math.floor(this.dynTrashSize * TRASH_SCALE_Y);
		const trashX = Math.max(4, this.stageWidth - trashWidth - 12);
		const trashY = this.stageHeight - trashHeight - 12;
		// Try to use a real image for trash if running in the browser; otherwise fall back to a colored rect for tests
		if (typeof window !== 'undefined') {
			try {
				const trashImg = new Image();
				trashImg.src = 'trash.png';
				this.trashRect = new Konva.Image({
					image: trashImg,
					x: trashX,
					y: trashY,
					width: trashWidth,
					height: trashHeight,
					opacity: 1,
					listening: true,
				});
				trashImg.onload = () => this.gameLayer?.draw();
			} catch (_) {
				this.trashRect = new Konva.Rect({
					x: trashX,
					y: trashY,
					width: trashWidth,
					height: trashHeight,
					fill: '#ef4444',
					cornerRadius: 8,
					opacity: 1,
				});
			}
		} else {
			this.trashRect = new Konva.Rect({
				x: trashX,
				y: trashY,
				width: trashWidth,
				height: trashHeight,
				fill: '#ef4444',
				cornerRadius: 8,
				opacity: 0.9,
			});
		}

		// Add items to layer and stage
		this.gameLayer.add(this.draggableLabelGroup);
		this.gameLayer.add(this.trashRect);
		this.gameStage.add(this.gameLayer);

		// Fit the label text to the card after nodes are created (initial state)
		this.fitLabelTextToCard();

		// Drag handling for label
		const onDragStart = () => {
			this.isDraggingLabel = true;
			this.clearHighlights();
			this.draggableLabelGroup.to({
				scaleX: 1.05,
				scaleY: 1.05,
				duration: 0.06,
				easing: Konva.Easings.EaseOut,
			});
		};
		const onDragMove = () => {
			const labelBox = this.getNodeRect(this.draggableLabelGroup);

			// Highlight any intersecting customer
			let found = false;
			for (const [customerId, rect] of this.customerRects.entries()) {
				if (this._rectsIntersect(labelBox, this.getNodeRect(rect))) {
					this.highlightTarget(rect);
					found = true;
					break;
				}
			}
			// Highlight trash if not found on customer
			if (
				!found &&
				this.trashRect &&
				this._rectsIntersect(labelBox, this.getNodeRect(this.trashRect))
			) {
				this.highlightTarget(this.trashRect);
				found = true;
			}
			if (!found) this.clearHighlights();
		};

		const onDragEnd = () => {
			if (!this.gameLayer) return;
			const labelBox = this.getNodeRect(this.draggableLabelGroup);

			// Check drop on customers
			let droppedOnCustomer: string | null = null;
			for (const [customerId, rect] of this.customerRects.entries()) {
				if (this._rectsIntersect(labelBox, this.getNodeRect(rect))) {
					droppedOnCustomer = customerId;
					break;
				}
			}

			// Check drop on trash
			const droppedOnTrash =
				this.trashRect && this._rectsIntersect(labelBox, this.getNodeRect(this.trashRect));

			// Clear any remaining highlights
			this.clearHighlights();

			if (droppedOnCustomer) {
				console.log('Dropped label on customer:', droppedOnCustomer);
				if (this.dropHandler) this.dropHandler('customer', droppedOnCustomer);
				// Instant snap-back when consumed (feels like old label gone, new one appears)
				this.draggableLabelGroup.x(this.baseLabelX);
				this.draggableLabelGroup.y(this.baseLabelY);
				this.draggableLabelGroup.scaleX(1);
				this.draggableLabelGroup.scaleY(1);
			} else if (droppedOnTrash) {
				console.log('Dropped label on trash');
				if (this.dropHandler) this.dropHandler('trashcan');
				// Instant snap-back when consumed (feels like old label gone, new one appears)
				this.draggableLabelGroup.x(this.baseLabelX);
				this.draggableLabelGroup.y(this.baseLabelY);
				this.draggableLabelGroup.scaleX(1);
				this.draggableLabelGroup.scaleY(1);
			} else {
				console.log('Dropped label on empty area');
				// Animated snap-back for invalid drop (visual feedback that drop failed)
				this.draggableLabelGroup.to({
					x: this.baseLabelX,
					y: this.baseLabelY,
					scaleX: 1,
					scaleY: 1,
					duration: 0.08,
					easing: Konva.Easings.EaseOut,
				});
			}

			this.isDraggingLabel = false;
		};

		this.draggableLabelGroup.on('dragstart', onDragStart);
		this.draggableLabelGroup.on('dragmove', onDragMove);
		this.draggableLabelGroup.on('dragend', onDragEnd);

		// Handle window resize to recompute layout
		this.resizeHandler = () => {
			try {
				this.layoutGameStage();
			} catch (_) {}
		};
		if (typeof window !== 'undefined' && window.addEventListener)
			window.addEventListener('resize', this.resizeHandler);
	}

	// Computes available height for the gameplay stage such that the whole screen fits in the container without scrolling
	private computeAvailableGameStageHeight(): number {
		// Use container height instead of viewport height for proper nesting
		const container = document.getElementById('container') as HTMLElement | null;
		const containerHeight = container?.clientHeight || GAME_STAGE_HEIGHT;

		// Measure actual block heights when possible
		const progressEl = document.getElementById(
			'progress-konva-container',
		) as HTMLElement | null;
		const scoreEl = document.getElementById('score-display') as HTMLElement | null;
		const labelEl = document.getElementById('label-display') as HTMLElement | null;
		const customersEl = document.getElementById('customers-display') as HTMLElement | null;

		const progressH = progressEl?.offsetHeight || 40;
		const statsH =
			(scoreEl?.offsetHeight || 20) +
			(labelEl?.offsetHeight || 20) +
			(customersEl?.offsetHeight || 20);
		// No separate patience section anymore
		const VERTICAL_MARGINS = 24; // tighter margins: progress(6+6) + game(6+6)
		const available = containerHeight - progressH - statsH - VERTICAL_MARGINS;
		return Math.max(140, Math.floor(available));
	}

	/**
	 * Compute layout based on current stageWidth/stageHeight and reposition elements.
	 */
	private layoutGameStage(): void {
		if (!this.gameStage || !this.gameLayer) return;
		const containerEl = document.getElementById('game-stage-container') as HTMLElement | null;
		const winW =
			typeof window !== 'undefined' && (window as any).innerWidth
				? (window as any).innerWidth
				: GAME_STAGE_WIDTH;
		this.computeDynamicMetrics(containerEl?.clientWidth || winW);
		this.computeCustomerSpotPositions();

		this.gameStage.width(this.stageWidth).height(this.stageHeight);

		// reposition label and trash
		const labelY = this.stageHeight - this.dynLabelHeight - 12;
		const labelWidth = this.dynLabelWidth;
		const labelX = Math.floor((this.stageWidth - labelWidth) / 2);
		this.baseLabelX = labelX;
		this.baseLabelY = labelY;
		if (!this.isDraggingLabel) {
			this.draggableLabelGroup.x(labelX).y(labelY);
		}
		// Refit label text to new card dimensions after resize
		this.fitLabelTextToCard();
		// Update the home placeholder position/size as well
		if (this.labelHomeRect) {
			this.labelHomeRect.x(labelX).y(labelY).width(labelWidth).height(this.dynLabelHeight);
		}
		const trashWidth = Math.floor(this.dynTrashSize * TRASH_SCALE_X);
		const trashHeight = Math.floor(this.dynTrashSize * TRASH_SCALE_Y);
		const trashX = Math.max(4, this.stageWidth - trashWidth - 12);
		const trashY = this.stageHeight - trashHeight - 12;
		this.trashRect!.x(trashX).y(trashY).width(trashWidth).height(trashHeight);

		// reposition existing customers based on screenSpots
		const barH = Math.max(4, Math.floor(this.dynCustomerSize * 0.1));
		for (let spot = 0; spot < 3; spot++) {
			const cid = this.screenSpots.get(spot);
			if (!cid) continue;
			const pos = this.spotPositions[spot];
			if (!pos) continue;
			this.customerRects
				.get(cid)
				?.x(pos.x)
				.y(pos.y + 18);
			this.customerPatienceTexts
				.get(cid)
				?.x(pos.x)
				.y(pos.y - 12);
			this.customerTypeTexts
				.get(cid)
				?.x(pos.x)
				.y(pos.y + 18 + this.dynCustomerSize + 4)
				.width(this.dynCustomerSize);
			this.customerPatienceBarBg
				.get(cid)
				?.x(pos.x)
				.y(pos.y)
				.width(this.dynCustomerSize)
				.height(barH);
			this.customerPatienceBarFg.get(cid)?.x(pos.x).y(pos.y).height(barH);
		}

		this.gameLayer.draw();
	}

	private _rectsIntersect(
		a: { x: number; y: number; width: number; height: number },
		b: { x: number; y: number; width: number; height: number },
	): boolean {
		return (
			a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y
		);
	}

	/** Highlight a Konva shape (customer rect or trash) to provide drag-over feedback. */
	private highlightTarget(shape: Konva.Shape): void {
		if (this.highlightedTarget === shape) return;
		this.clearHighlights();
		this.highlightedTarget = shape;
		shape.stroke('#f59e0b').strokeWidth(4);
		this.gameLayer?.draw();
	}

	/** Clear any existing highlight on previously highlighted target. */
	private clearHighlights(): void {
		if (!this.highlightedTarget) return;
		this.highlightedTarget.stroke(null).strokeWidth(0);
		this.highlightedTarget = null;
		this.gameLayer?.draw();
	}

	// Allow controller to inject a drop handler callback
	public setDropHandler(
		handler: (target: 'customer' | 'trashcan', customerId?: string) => void,
	): void {
		this.dropHandler = handler;
	}

	updateScore(score: number): void {
		const scoreElement = document.getElementById('score-value');
		if (scoreElement) scoreElement.textContent = score.toString();
	}

	/**
	 * Updates the progress bar and numeric text (e.g., 3/10)
	 * Shows green bar for correct, red bar for incorrect
	 */
	updateProgress(correct: number, incorrect: number, total: number): void {
		if (!this.progressBarCorrect || !this.progressBarIncorrect || !this.progressText) return;

		const safeTotal = Math.max(0, total);
		const totalServed = Math.min(correct + incorrect, safeTotal);
		const percentCorrect =
			safeTotal > 0 ? Math.min(100, Math.max(0, (correct * 100) / safeTotal)) : 0;
		const percentTotal =
			safeTotal > 0 ? Math.min(100, Math.max(0, (totalServed * 100) / safeTotal)) : 0;

		const targetWidthCorrect = (PROGRESS_BAR_WIDTH * percentCorrect) / 100;
		const targetWidthTotal = (PROGRESS_BAR_WIDTH * percentTotal) / 100;

		this.progressBarIncorrect.to({
			width: targetWidthTotal,
			duration: PROGRESS_ANIM_DURATION,
			easing: Konva.Easings.EaseOut,
		});
		this.progressBarCorrect.to({
			width: targetWidthCorrect,
			duration: PROGRESS_ANIM_DURATION,
			easing: Konva.Easings.EaseOut,
		});

		// Update text to show correct/total with percentage (rounded)
		const percentDisplay = Math.round(percentCorrect);
		this.progressText.text(correct + '/' + safeTotal + ' (' + percentDisplay + '%)');
	}

	/** Updates the current label display */
	updateLabel(label: string): void {
		this.currentLabel = label;
		if (this.draggableLabelGroup) {
			const textNode = this.draggableLabelGroup.children[1]; // Text is second child
			if (textNode) {
				textNode.text(label);
				this.fitLabelTextToCard();
			}
		}
	}

	/** Ensure the draggable label's text fits within the square card and is vertically centered. */
	private fitLabelTextToCard(): void {
		if (!this.draggableLabelGroup) return;
		const textNode = this.draggableLabelGroup.children[1];
		if (!textNode) return;
		const label = this.currentLabel || 'Label';
		const padding = Math.max(6, Math.floor(this.dynLabelWidth * 0.08));
		const maxWidth = Math.max(10, this.dynLabelWidth - padding * 2);
		let fontSize = Math.max(8, Math.floor(this.dynLabelHeight * 0.26));
		const minFont = 8;

		const measure = (t: string, fs: number): number => {
			try {
				if (!this.measureCtx && typeof document !== 'undefined') {
					const canvas = document.createElement('canvas');
					this.measureCtx = canvas.getContext('2d');
				}
				if (this.measureCtx) {
					this.measureCtx.font = fs + 'px system-ui, sans-serif';
					return this.measureCtx.measureText(t).width;
				}
			} catch (_) {}
			return t.length * fs * 0.6;
		};

		let safety = 40;
		while (measure(label, fontSize) > maxWidth && fontSize > minFont && safety-- > 0)
			fontSize -= 1;

		const centeredY = Math.max(0, Math.floor((this.dynLabelHeight - fontSize) / 2));
		textNode.fontSize(fontSize).width(this.dynLabelWidth).x(0).y(centeredY);
		this.gameLayer?.draw();
	}

	/** Updates the customer display with current customer data */
	updateCustomers(customerData: CustomerDisplayData[]): void {
		this.updateCustomerStage(customerData);
	}

	/**
	 * Displays a game over message
	 */
	showGameOver(finalScore: number): void {
		// Create centered popup overlay
		const wrapper = document.getElementById('view-placeholder');
		if (!wrapper) return;
		let overlay = document.getElementById('game-over-overlay');
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.id = 'game-over-overlay';
			overlay.style.cssText = [
				'position: fixed',
				'left: 0',
				'top: 0',
				'width: 100vw',
				'height: 100vh',
				'background: rgba(0,0,0,0.45)',
				'display: flex',
				'align-items: center',
				'justify-content: center',
				'z-index: 9999',
			].join(';');
			const panel = document.createElement('div');
			panel.id = 'game-over-panel';
			panel.style.cssText = [
				'background: #ffffff',
				'border-radius: 12px',
				'padding: 20px 24px',
				'box-shadow: 0 10px 30px rgba(0,0,0,0.25)',
				'min-width: 240px',
				'text-align: center',
				'font-family: system-ui, sans-serif',
			].join(';');
			panel.innerHTML = `
				<div style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 8px;">Game Over</div>
				<div style="font-size: 16px; color: #374151; margin-bottom: 12px;">Final Score: <strong>${finalScore}</strong></div>
				<button id="game-over-close" style="margin-top: 4px; padding: 8px 12px; border-radius: 8px; border: none; background: #3b82f6; color: #fff; font-weight: 600; cursor: pointer;">Close</button>
			`;
			overlay.appendChild(panel);
			wrapper.appendChild(overlay);

			const closeBtn = document.getElementById('game-over-close');
			if (closeBtn) {
				closeBtn.addEventListener('click', () => {
					overlay?.remove();
				});
			}
		}
	}

	/**
	 * Clears the view
	 */
	clear(): void {
		document.getElementById('view-placeholder')?.remove();
	}

	private getPatienceColor(patience: number): string {
		return patience >= 50 ? '#22c55e' : patience >= 25 ? '#f59e0b' : '#ef4444';
	}

	/**
	 * Update or create the three customer placeholders at the top of the gameplay stage.
	 * Shows patience above each customer and handles fade-out on zero patience.
	 */
	private updateCustomerStage(customerData: CustomerDisplayData[]): void {
		if (!this.gameStage || !this.gameLayer) return;

		// Maintain screen spot mapping: free spots whose customers left, assign new customers to empty spots
		const incomingIds = new Set(customerData.map((c) => c.customerId));
		for (let spot = 0; spot < 3; spot++) {
			const id = this.screenSpots.get(spot);
			if (id && !incomingIds.has(id)) this.screenSpots.set(spot, null);
		}
		const placed = new Set(
			Array.from(this.screenSpots.values()).filter((v): v is string => v !== null),
		);
		const newCustomersToPlace = customerData
			.filter((c) => !placed.has(c.customerId))
			.map((c) => c.customerId);
		let ni = 0;
		for (let spot = 0; spot < 3 && ni < newCustomersToPlace.length; spot++) {
			if (this.screenSpots.get(spot) === null)
				this.screenSpots.set(spot, newCustomersToPlace[ni++]);
		}

		// Build a lookup for active customers by ID
		const activeIds = new Set(customerData.map((c) => c.customerId));

		// Remove visuals for customers who are no longer present
		for (const [id, rect] of Array.from(this.customerRects.entries())) {
			if (!activeIds.has(id)) {
				rect.destroy();
				this.customerPatienceTexts.get(id)?.destroy();
				this.customerTypeTexts.get(id)?.destroy();
				this.customerPatienceBarBg.get(id)?.destroy();
				this.customerPatienceBarFg.get(id)?.destroy();
				this.customerRects.delete(id);
				this.customerPatienceTexts.delete(id);
				this.customerTypeTexts.delete(id);
				this.customerPatienceBarBg.delete(id);
				this.customerPatienceBarFg.delete(id);
			}
		}

		// Place or update up to three customers by exact spot mapping
		for (let i = 0; i < 3; i++) {
			const spot = this.spotPositions[i];
			if (!spot) continue;
			const currentId = this.screenSpots.get(i);
			if (!currentId) continue; // empty spot
			const c = customerData.find((x) => x.customerId === currentId);
			if (!c) continue;

			let rect = this.customerRects.get(c.customerId);
			let text = this.customerPatienceTexts.get(c.customerId);

			if (!rect) {
				// Create a new placeholder character (simple rectangle)
				rect = new Konva.Rect({
					x: spot.x,
					y: spot.y + 18,
					width: this.dynCustomerSize,
					height: this.dynCustomerSize,
					fill: '#94a3b8',
					cornerRadius: 12,
					opacity: 1,
				});
				this.customerRects.set(c.customerId, rect);
				this.gameLayer.add(rect);

				// Patience text above (slightly above the bar)
				text = new Konva.Text({
					x: spot.x,
					y: spot.y - 12,
					width: this.dynCustomerSize,
					align: 'center',
					text: Math.round(c.patience) + '%',
					fontSize: 14,
					fill: this.getPatienceColor(c.patience),
					stroke: 'black',
					strokeWidth: 0.5,
				});
				this.customerPatienceTexts.set(c.customerId, text);
				this.gameLayer.add(text);

				// Patience progress bar (background + foreground) - thinner
				const barH = Math.max(4, Math.floor(this.dynCustomerSize * 0.1));
				const barBg = new Konva.Rect({
					x: spot.x,
					y: spot.y,
					width: this.dynCustomerSize,
					height: barH,
					fill: '#e5e7eb',
					cornerRadius: 4,
					stroke: 'black',
					strokeWidth: 0.5,
				});
				const barFg = new Konva.Rect({
					x: spot.x,
					y: spot.y,
					width: Math.max(
						0,
						Math.floor(
							(this.dynCustomerSize * c.patience) /
								CookingGameConfig.INITIAL_PATIENCE,
						),
					),
					height: barH,
					fill: this.getPatienceColor(c.patience),
					stroke: 'black',
					strokeWidth: 0.5,
					cornerRadius: 4,
				});
				this.customerPatienceBarBg.set(c.customerId, barBg);
				this.customerPatienceBarFg.set(c.customerId, barFg);
				this.gameLayer.add(barBg);
				this.gameLayer.add(barFg);

				// Customer species label under the character
				const typeText = new Konva.Text({
					x: spot.x,
					y: spot.y + 18 + this.dynCustomerSize + 4,
					width: this.dynCustomerSize,
					align: 'center',
					text: c.customerType + ' — ' + Math.round(c.patience) + '%',
					fontSize: 12,
					fill: '#111827',
				});
				this.customerTypeTexts.set(c.customerId, typeText);
				this.gameLayer.add(typeText);
			} else {
				// Update position (in case of remap)
				rect.x(spot.x).y(spot.y + 18);
				if (text) text.x(spot.x).y(spot.y - 12);
				const typeText = this.customerTypeTexts.get(c.customerId);
				if (typeText)
					typeText
						.x(spot.x)
						.y(spot.y + 18 + this.dynCustomerSize + 4)
						.width(this.dynCustomerSize);
			}

			// Update patience display + progress bar width/color and label text
			const color = this.getPatienceColor(c.patience);
			if (text) text.text(Math.round(c.patience) + '%').fill(color);
			const barFg = this.customerPatienceBarFg.get(c.customerId);
			if (barFg) {
				const bw = Math.max(
					0,
					Math.floor(
						(this.dynCustomerSize * c.patience) / CookingGameConfig.INITIAL_PATIENCE,
					),
				);
				barFg.width(bw).fill(color);
			}
			const typeText = this.customerTypeTexts.get(c.customerId);
			if (typeText) typeText.text(c.customerType + ' — ' + Math.round(c.patience) + '%');

			// Fade-out and remove when patience is depleted
			if (c.patience <= 0 && rect) {
				const fadeOut = (node: any) =>
					node?.to({ opacity: 0, duration: 0.12, onFinish: () => node.destroy() });
				fadeOut(rect);
				fadeOut(text);
				fadeOut(this.customerTypeTexts.get(c.customerId));
				this.customerPatienceBarBg.get(c.customerId)?.destroy();
				this.customerPatienceBarFg.get(c.customerId)?.destroy();
				this.customerPatienceBarBg.delete(c.customerId);
				this.customerPatienceBarFg.delete(c.customerId);
				this.customerRects.delete(c.customerId);
				this.customerPatienceTexts.delete(c.customerId);
				this.customerTypeTexts.delete(c.customerId);
			}
		}

		this.gameLayer.draw();
	}

	public getCurrentLabel(): string {
		return this.currentLabel;
	}
}
