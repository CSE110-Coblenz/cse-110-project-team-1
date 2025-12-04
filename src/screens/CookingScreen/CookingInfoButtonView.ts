/**
 * View for the cooking info button.
 * Creates a fixed-position help button that triggers a callback when clicked.
 */
export class CookingInfoButtonView {
	private button: HTMLButtonElement;
	private onInfoClick: () => void;

	constructor(onInfoClick: () => void) {
		this.onInfoClick = onInfoClick;
		this.button = this.createButton();
	}

	private createButton(): HTMLButtonElement {
		const btn = document.createElement('button');
		btn.id = 'cooking-info-btn';
		btn.title = 'View cooking tutorial';
		btn.innerText = 'i';
		btn.style.cssText = [
			'position: fixed',
			'top: 16px',
			'right: 16px',
			'width: 44px',
			'height: 44px',
			'border-radius: 50%',
			'border: 2px solid white',
			'background: #3b82f6',
			'color: white',
			'font-size: 20px',
			'font-weight: 700',
			'font-family: system-ui, sans-serif',
			'cursor: pointer',
			'z-index: 10001',
			'box-shadow: 0 4px 12px rgba(0,0,0,0.4)',
			'display: flex',
			'align-items: center',
			'justify-content: center',
			'transition: transform 0.15s ease',
		].join(';');

		btn.addEventListener('mouseenter', () => {
			btn.style.transform = 'scale(1.1)';
		});
		btn.addEventListener('mouseleave', () => {
			btn.style.transform = 'scale(1)';
		});
		btn.addEventListener('click', () => {
			this.onInfoClick();
		});

		return btn;
	}

	show(): void {
		document.body.appendChild(this.button);
	}

	hide(): void {
		if (this.button.parentNode) {
			this.button.parentNode.removeChild(this.button);
		}
	}
}

export default CookingInfoButtonView;
