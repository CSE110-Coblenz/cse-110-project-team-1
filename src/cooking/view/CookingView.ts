import { CustomerDisplayData } from 'src/cooking/types/CustomerDisplayData';
import Konva from 'konva';

export class CookingView {
	private progressStage: Konva.Stage | null = null;
	private progressBarCorrect: Konva.Rect | null = null;
	private progressBarIncorrect: Konva.Rect | null = null;
	private progressText: Konva.Text | null = null;

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
			container.innerHTML += `
                <div id="view-placeholder" style="border: 2px solid blue; padding: 10px; margin-top: 20px;">
                    <h2>View Component Placeholder</h2>
                    <div id="progress-konva-container" style="margin: 8px 0 12px;"></div>
                    <div id="score-display">Score: <span id="score-value">0</span></div>
                    <div id="label-display">Label: <span id="label-value">none</span></div>
                    <div id="customers-display">Customers: <span id="customers-value">[]</span></div>
                    <div id="game-status"></div>
                </div>
            `;

			// Create Konva progress bar
			this.createKonvaProgressBar();

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
			width: 400,
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
			width: 400,
			height: 16,
			fill: '#e5e7eb',
			cornerRadius: 8,
		});

		// Incorrect bar (red, under green)
		this.progressBarIncorrect = new Konva.Rect({
			x: 0,
			y: 20,
			width: 0,
			height: 16,
			fill: '#ef4444',
			cornerRadius: 8,
		});

		// Correct progress bar (green, on top)
		this.progressBarCorrect = new Konva.Rect({
			x: 0,
			y: 20,
			width: 0,
			height: 16,
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

		const targetWidthCorrect = (400 * percentCorrect) / 100;
		const targetWidthTotal = (400 * percentTotal) / 100;

		// Animate red bar (total served = correct + incorrect)
		const tweenIncorrect = new Konva.Tween({
			node: this.progressBarIncorrect,
			duration: 0.25,
			width: targetWidthTotal,
			easing: Konva.Easings.EaseInOut,
		});
		tweenIncorrect.play();

		// Animate green bar (correct only)
		const tweenCorrect = new Konva.Tween({
			node: this.progressBarCorrect,
			duration: 0.25,
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
}
