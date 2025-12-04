/**
 * View for the cooking help popup overlay.
 * Displays instructions and a close button.
 */
export class CookingHelpPopupView {
	private overlay: HTMLDivElement | null = null;

	show(): void {
		if (this.overlay) return; // Already showing

		// Create overlay
		this.overlay = document.createElement('div');
		this.overlay.id = 'cooking-help-overlay';
		this.overlay.style.cssText = [
			'position: fixed',
			'top: 0',
			'left: 0',
			'width: 100%',
			'height: 100%',
			'background: rgba(0, 0, 0, 0.7)',
			'display: flex',
			'align-items: center',
			'justify-content: center',
			'z-index: 10002',
			'font-family: system-ui, sans-serif',
		].join(';');

		// Create help panel
		const panel = document.createElement('div');
		panel.style.cssText = [
			'background: white',
			'border-radius: 12px',
			'padding: 24px',
			'max-width: 500px',
			'width: 90%',
			'max-height: 80vh',
			'overflow-y: auto',
			'box-shadow: 0 20px 60px rgba(0,0,0,0.5)',
		].join(';');

		panel.innerHTML = `
			<h2 style="margin: 0 0 16px 0; font-size: 24px; color: #111827;">Cooking Help</h2>
			<div style="color: #374151; font-size: 15px; line-height: 1.6;">
				<p style="margin: 0 0 12px 0;"><strong>How to play:</strong></p>
				<ul style="margin: 0 0 16px 0; padding-left: 20px;">
					<li style="margin-bottom: 8px;">Drag labels onto the correct customer</li>
					<li style="margin-bottom: 8px;">Match their ecological role (producer/consumer/decomposer)</li>
					<li style="margin-bottom: 8px;">Use the trash can to discard wrong labels</li>
					<li style="margin-bottom: 8px;">Serve customers before their patience runs out</li>
				</ul>
				<button id="close-help-btn" style="width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer;">
					Close
				</button>
			</div>
		`;

		this.overlay.appendChild(panel);
		document.body.appendChild(this.overlay);

		// Close on button click or overlay click
		const closeBtn = document.getElementById('close-help-btn');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => this.hide());
		}
		this.overlay.addEventListener('click', (e) => {
			if (e.target === this.overlay) this.hide();
		});
	}

	hide(): void {
		if (this.overlay && this.overlay.parentNode) {
			this.overlay.parentNode.removeChild(this.overlay);
			this.overlay = null;
		}
	}
}

export default CookingHelpPopupView;
