import { CustomerDisplayData } from 'src/cooking/types/CustomerDisplayData';
import Konva from 'konva';

// View constants (avoid magic numbers)
const PROGRESS_BAR_WIDTH = 400;
const PROGRESS_BAR_HEIGHT = 16;
const PATIENCE_BAR_WIDTH = 400;
const PATIENCE_ROW_HEIGHT = 28; // label row height
const PATIENCE_BAR_HEIGHT = 12;
const ANIM_DURATION = 0.25; // seconds
// Snappy animation for progress updates
const PROGRESS_ANIM_DURATION = 0.08; // seconds

export class CookingView {
	private progressStage: Konva.Stage | null = null;
	private progressBarCorrect: Konva.Rect | null = null;
	private progressBarIncorrect: Konva.Rect | null = null;
	private progressText: Konva.Text | null = null;
	// Patience bar stage and per-customer bar references
	private patienceStage: Konva.Stage | null = null;
	private patienceBarMap: Map<string, Konva.Rect> = new Map();
	private patienceLabelMap: Map<string, Konva.Text> = new Map();
	// Track which customer is in each screen spot (0, 1, 2) for stable positioning
	// spot -> customerId (null = empty spot)
	private screenSpots: Map<number, string | null> = new Map([
		[0, null],
		[1, null],
		[2, null],
	]);

	constructor() {
		console.log('CookingView created');
	}

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
		console.log('CookingView.initialize called');
		console.log('Customer data:', customerData);
		console.log('Current label:', label);
		console.log('Score:', score);

		// Get the container element
		const container = document.getElementById('container');

		if (container) {
			//basic placeholder structure
			// Only append placeholder once; keep markup simple
			if (!document.getElementById('view-placeholder')) {
				const wrapper = document.createElement('div');
				wrapper.id = 'view-placeholder';
				wrapper.style.cssText = 'border: 2px solid blue; padding: 10px; margin-top: 20px;';
				wrapper.innerHTML = '' +
					'<h2>View Component Placeholder</h2>' +
					'<div id="progress-konva-container" style="margin: 8px 0 12px;"></div>' +
					'<div id="score-display">Score: <span id="score-value">0</span></div>' +
					'<div id="label-display">Label: <span id="label-value">none</span></div>' +
					'<div id="customers-display">Customers: <span id="customers-value">[]</span></div>' +
					'<div id="patience-konva-container" style="margin: 12px 0;"></div>' +
					'<div id="game-status"></div>';
				container.appendChild(wrapper);
			}

			// Create Konva progress bar
			this.createKonvaProgressBar();

			// If initial progress provided, set bars now (before other textual updates)
			if (progress) {
				this.updateProgress(progress.correct, progress.incorrect, progress.total);
			}

			// Create patience bars for initial customers
			this.createOrRebuildPatienceStage(customerData);
			//Update initial data
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
	 * Updates the score display
	 */
	updateScore(score: number): void {
		console.log('Updating score:', score);

		const scoreElement = document.getElementById('score-value');
		if (scoreElement) {
			scoreElement.textContent = score.toString();
		}
	}

	/**
	 * Updates the progress bar and numeric text (e.g., 3/10)
	 * Shows green bar for correct, red bar for incorrect
	 */
	updateProgress(correct: number, incorrect: number, total: number): void {
		if (!this.progressBarCorrect || !this.progressBarIncorrect || !this.progressText) {
			return;
		}

		let safeTotal = total;
		if (safeTotal < 1) {
			safeTotal = 0;
		}

		let totalServed = correct + incorrect;
		if (totalServed > safeTotal) {
			totalServed = safeTotal;
		}

		let percentCorrect = 0;
		let percentTotal = 0;
		if (safeTotal > 0) {
			percentCorrect = (correct * 100) / safeTotal;
			percentTotal = (totalServed * 100) / safeTotal;

			if (percentCorrect < 0) {
				percentCorrect = 0;
			}
			if (percentCorrect > 100) {
				percentCorrect = 100;
			}
			if (percentTotal < 0) {
				percentTotal = 0;
			}
			if (percentTotal > 100) {
				percentTotal = 100;
			}
		}

		const targetWidthCorrect = (PROGRESS_BAR_WIDTH * percentCorrect) / 100;
		const targetWidthTotal = (PROGRESS_BAR_WIDTH * percentTotal) / 100;

		// Smooth animation with finish() to complete any in-progress tweens immediately
		// This prevents animation queue buildup that causes lag/snapping
		(this.progressBarIncorrect as any).to({
			width: targetWidthTotal,
			duration: PROGRESS_ANIM_DURATION,
			easing: Konva.Easings.EaseOut,
		});

		(this.progressBarCorrect as any).to({
			width: targetWidthCorrect,
			duration: PROGRESS_ANIM_DURATION,
			easing: Konva.Easings.EaseOut,
		});

		// Update text to show correct/total with percentage (rounded)
		const percentDisplay = Math.round(percentCorrect);
		this.progressText.text(correct + '/' + safeTotal + ' (' + percentDisplay + '%)');
	}

	/**
	 * Updates the current label display
	 */
	updateLabel(label: string): void {
		console.log('Updating label:', label);

		const labelElement = document.getElementById('label-value');
		if (labelElement) {
			labelElement.textContent = label;
		}
	}

	/**
	 * Updates the customer display with current customer data
	 */
	updateCustomers(customerData: CustomerDisplayData[]): void {
		console.log('Updating customers:', customerData);

		const customersElement = document.getElementById('customers-value');
		if (customersElement) {
			// Simple display of customer count and types
			let customerSummary = '';
			for (let i = 0; i < customerData.length; i++) {
				const roundedPatience = Math.round(customerData[i].patience);
				customerSummary +=
					customerData[i].customerType + '(' + roundedPatience + '%)';
				if (i < customerData.length - 1) {
					customerSummary += ', ';
				}
			}
			customersElement.textContent = customerSummary || 'none';
		}
		// Update patience bars (animate changes)
		this.updatePatienceBars(customerData);
	}

	/**
	 * Displays a game over message
	 */
	showGameOver(finalScore: number): void {
		console.log('Game over! Final score:', finalScore);

		const statusElement = document.getElementById('game-status');
		if (statusElement) {
			statusElement.innerHTML = `<strong style="color: red;">GAME OVER! Final Score: ${finalScore}</strong>`;
		}
	}

	/**
	 * Clears the view
	 */
	clear(): void {
		console.log('Clearing view');

		const placeholder = document.getElementById('view-placeholder');
		if (placeholder) {
			placeholder.remove();
		}
	}

	/**
	 * Creates or rebuilds the patience bar stage for current active customers.
	 * Called at initialization or when customer list structure changes.
	 * Maintains stable screen positions: tracks which customer is in each of the 3 spots.
	 */
	private createOrRebuildPatienceStage(customerData: CustomerDisplayData[]): void {
		const container = document.getElementById('patience-konva-container');
		if (!container) {
			return;
		}

		// Build set of incoming customer IDs
		const incomingIds = new Set(customerData.map((c) => c.customerId));

		// Step 1: See which customers have left and free their spots
		for (const [spot, customerId] of this.screenSpots.entries()) {
			if (customerId !== null && !incomingIds.has(customerId)) {
				this.screenSpots.set(spot, null); // Mark spot as empty
			}
		}

		// Step 2: Find new customers (in incoming data but not currently in any spot)
		const currentlyDisplayed = new Set(
			Array.from(this.screenSpots.values()).filter((id) => id !== null),
		);
		const newCustomers: string[] = [];
		for (const customer of customerData) {
			if (!currentlyDisplayed.has(customer.customerId)) {
				newCustomers.push(customer.customerId);
			}
		}

		// Step 3: Assign new customers to empty spots (fill lower spots first)
		let newCustomerIndex = 0;
		for (let spot = 0; spot < 3; spot++) {
			if (
				this.screenSpots.get(spot) === null &&
				newCustomerIndex < newCustomers.length
			) {
				this.screenSpots.set(spot, newCustomers[newCustomerIndex]);
				newCustomerIndex++;
			}
		}

		// Rebuild stage
		if (this.patienceStage) {
			this.patienceStage.destroy();
			this.patienceStage = null;
			this.patienceBarMap.clear();
			this.patienceLabelMap.clear();
		}

		const width = PATIENCE_BAR_WIDTH;
		const rowHeight = PATIENCE_ROW_HEIGHT;
		const totalHeight = customerData.length * rowHeight;
		let stageHeight = totalHeight;
		if (stageHeight <= 40) {
			stageHeight = 40;
		}

		this.patienceStage = new Konva.Stage({
			container: 'patience-konva-container',
			width: width,
			height: stageHeight,
		});
		const layer = new Konva.Layer();

		// Build a map for quick lookup: customerId -> customerData
		const customerDataMap = new Map<string, CustomerDisplayData>();
		for (const c of customerData) {
			customerDataMap.set(c.customerId, c);
		}

		// Render customers in screen spot order (0, 1, 2)
		let rowIndex = 0;
		for (let spot = 0; spot < 3; spot++) {
			const customerId = this.screenSpots.get(spot);
			if (customerId === null || customerId === undefined) {
				continue; // Skip empty spots
			}

			const c = customerDataMap.get(customerId);
			if (!c) {
				continue; // Skip if customer data not found
			}

			const yBase = rowIndex * rowHeight;
			// Text label: ID or type
			const labelText = new Konva.Text({
				x: 0,
				y: yBase,
				text: c.customerType + ' (' + c.customerId + ')',
				fontSize: 12,
				fill: 'black',
			});
			layer.add(labelText);
			this.patienceLabelMap.set(c.customerId, labelText);

			// Background bar
			const bg = new Konva.Rect({
				x: 0,
				y: yBase + 14,
				width: width,
				height: 12,
				fill: '#e5e7eb',
				cornerRadius: 6,
			});
			layer.add(bg);

			// Foreground bar (patience value)
			const color = this.getPatienceColor(c.patience);
			const fg = new Konva.Rect({
				x: 0,
				y: yBase + 14,
				width: (PATIENCE_BAR_WIDTH * c.patience) / 100,
				height: 12,
				fill: color,
				cornerRadius: 6,
			});
			layer.add(fg);
			this.patienceBarMap.set(c.customerId, fg);

			rowIndex++;
		}

		this.patienceStage.add(layer);
	}

	/**
	 * Updates patience bar widths and colors with animation.
	 * Rebuilds if customer IDs have changed (not just count).
	 */
	private updatePatienceBars(customerData: CustomerDisplayData[]): void {
		// If stage not yet created but data exists, build it.
		let rebuilt = false;
		if (!this.patienceStage && customerData.length > 0) {
			this.createOrRebuildPatienceStage(customerData);
			rebuilt = true;
		}

		// Check if customer IDs have changed (Option B: detect ID changes)
		const currentIds = new Set(this.patienceBarMap.keys());
		const incomingIds = new Set(customerData.map((c) => c.customerId));

		let needRebuild = false;
		if (currentIds.size !== incomingIds.size) {
			needRebuild = true;
		} else {
			for (const id of currentIds) {
				if (!incomingIds.has(id)) {
					needRebuild = true;
					break;
				}
			}
		}

		// Preserve existing widths for stable visual continuity when rebuilding
		let oldWidths: Map<string, number> | null = null;
		if (needRebuild && this.patienceBarMap.size > 0) {
			oldWidths = new Map<string, number>();
			for (const [id, bar] of this.patienceBarMap.entries()) {
				try {
					oldWidths.set(id, bar.width());
				} catch (_) {
					oldWidths.set(id, 0);
				}
			}
		}

		if (needRebuild) {
			this.createOrRebuildPatienceStage(customerData);
			rebuilt = true;
			// Restore widths for existing customers if possible
			if (oldWidths) {
				for (const [id, width] of oldWidths.entries()) {
					const bar = this.patienceBarMap.get(id) as any;
					if (bar) {
						if (typeof bar.width === 'function') {
							bar.width(width);
						} else if (bar.attrs) {
							bar.attrs.width = width;
						}
					}
				}
			}
		}

		// IDs match, just animate the bars
		for (let i = 0; i < customerData.length; i++) {
			const c = customerData[i];
			const bar = this.patienceBarMap.get(c.customerId);
			if (!bar) {
				continue;
			}
			const targetWidth = (PATIENCE_BAR_WIDTH * c.patience) / 100;
			const color = this.getPatienceColor(c.patience);
			// Directly set width each frame to match exact patience; avoids lag-induced snapping
			const anyBar = bar as any;
			if (typeof anyBar.width === 'function') {
				anyBar.width(targetWidth);
			} else if (anyBar && anyBar.attrs) {
				anyBar.attrs.width = targetWidth;
			}
			if (typeof anyBar.fill === 'function') {
				anyBar.fill(color);
			} else if (anyBar && anyBar.attrs) {
				anyBar.attrs.fill = color;
			}
		}
	}

	/**
	 * Returns patience color based on thresholds.
	 */
	private getPatienceColor(patience: number): string {
		if (patience >= 50) {
			return '#22c55e'; // green
		}
		if (patience >= 25) {
			return '#f59e0b'; // orange
		}
		return '#ef4444'; // red
	}
}
