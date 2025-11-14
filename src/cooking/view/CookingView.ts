import { CustomerDisplayData } from 'src/cooking/types/CustomerDisplayData';
import Konva from 'konva';

// View constants (avoid magic numbers)
const PROGRESS_BAR_WIDTH = 400;
const PROGRESS_BAR_HEIGHT = 16;
const PATIENCE_BAR_WIDTH = 400;
const PATIENCE_ROW_HEIGHT = 28; // label row height
const PATIENCE_BAR_HEIGHT = 12;
const ANIM_DURATION = 0.25; // seconds

export class CookingView {
	private progressStage: Konva.Stage | null = null;
	private progressBarCorrect: Konva.Rect | null = null;
	private progressBarIncorrect: Konva.Rect | null = null;
	private progressText: Konva.Text | null = null;
	// Patience bar stage and per-customer bar references
	private patienceStage: Konva.Stage | null = null;
	private patienceBarMap: Map<string, Konva.Rect> = new Map();
	private patienceLabelMap: Map<string, Konva.Text> = new Map();

	constructor() {
		console.log('CookingView created');
	}

	/**
	 * Initialize the view with game data
	 */
	initialize(customerData: CustomerDisplayData[], label: string, score: number): void {
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

		// Progress numeric text (e.g., "0/5")
		this.progressText = new Konva.Text({
			x: 340,
			y: 0,
			text: '0/0',
			fontSize: 14,
			fill: 'black',
			width: 60,
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
			percentCorrect = Math.round((correct * 100) / safeTotal);
			percentTotal = Math.round((totalServed * 100) / safeTotal);

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

		const targetWidthCorrect = Math.round((PROGRESS_BAR_WIDTH * percentCorrect) / 100);
		const targetWidthTotal = Math.round((PROGRESS_BAR_WIDTH * percentTotal) / 100);

		// Animate red bar (total served = correct + incorrect)
		const tweenIncorrect = new Konva.Tween({
			node: this.progressBarIncorrect,
			duration: ANIM_DURATION,
			width: targetWidthTotal,
			easing: Konva.Easings.EaseInOut,
		});
		tweenIncorrect.play();

		// Animate green bar (correct only)
		const tweenCorrect = new Konva.Tween({
			node: this.progressBarCorrect,
			duration: ANIM_DURATION,
			width: targetWidthCorrect,
			easing: Konva.Easings.EaseInOut,
		});
		tweenCorrect.play();

		// Update text to show correct/total
		this.progressText.text(correct + '/' + safeTotal);
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
				customerSummary +=
					customerData[i].customerType + '(' + customerData[i].patience + '%)';
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
	 */
	private createOrRebuildPatienceStage(customerData: CustomerDisplayData[]): void {
		const container = document.getElementById('patience-konva-container');
		if (!container) {
			return;
		}

		// If stage exists and count changed, destroy and rebuild
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

		for (let i = 0; i < customerData.length; i++) {
			const c = customerData[i];
			const yBase = i * rowHeight;
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
				width: Math.round((PATIENCE_BAR_WIDTH * c.patience) / 100),
				height: 12,
				fill: color,
				cornerRadius: 6,
			});
			layer.add(fg);
			this.patienceBarMap.set(c.customerId, fg);
		}

		this.patienceStage.add(layer);
	}

	/**
	 * Updates patience bar widths and colors with animation.
	 */
	private updatePatienceBars(customerData: CustomerDisplayData[]): void {
		// If stage not yet created but data exists, build it.
		if (!this.patienceStage && customerData.length > 0) {
			this.createOrRebuildPatienceStage(customerData);
			return;
		}

		// If number differs, rebuild.
		if (this.patienceStage && this.patienceBarMap.size !== customerData.length) {
			this.createOrRebuildPatienceStage(customerData);
			return;
		}

		const width = PATIENCE_BAR_WIDTH;
		for (let i = 0; i < customerData.length; i++) {
			const c = customerData[i];
			const bar = this.patienceBarMap.get(c.customerId);
			if (!bar) {
				continue;
			}
			const targetWidth = Math.round((PATIENCE_BAR_WIDTH * c.patience) / 100);
			const color = this.getPatienceColor(c.patience);
			// Animate width change
			const tween = new Konva.Tween({
				node: bar,
				duration: ANIM_DURATION,
				width: targetWidth,
				fill: color,
				easing: Konva.Easings.EaseInOut,
			});
			tween.play();
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
