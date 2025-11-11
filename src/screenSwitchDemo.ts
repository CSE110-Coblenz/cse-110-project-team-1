import Konva from 'konva';
import ScreenManager from 'src/screens/ScreenManager';
import type { Screen } from 'src/types';

const stage = new Konva.Stage({
	container: 'container',
	width: 800,
	height: 600,
});

const layer = new Konva.Layer();
stage.add(layer);

const screenManager = new ScreenManager(layer);
screenManager.switchToScreen({ type: 'intro' });

const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-screen]');

buttons.forEach((button) => {
	button.addEventListener('click', () => {
		const target = button.dataset.screen as Screen['type'];
		if (!target) {
			return;
		}

		const screen: Screen =
			target === 'ending'
				? { type: 'ending' }
				: target === 'game'
					? { type: 'game' }
					: target === 'menu'
						? { type: 'menu' }
						: target === 'cooking'
							? { type: 'cooking' }
							: { type: 'intro' };

		screenManager.switchToScreen(screen);
	});
});

// handy for manual tinkering in devtools
(window as unknown as { screenManager: ScreenManager }).screenManager = screenManager;
