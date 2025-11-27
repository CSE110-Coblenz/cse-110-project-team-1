import { Game } from 'src/game-engine';

try {
	const app = document.getElementById('app') || document.body;
	const container = document.createElement('div');
	container.id = 'container';
	container.style.width = '100%';
	container.style.height = '100%';
	app.appendChild(container);

	// start the engine (dev placeholder parameters)
	const activeEngine = new Game(3, 'easy', 'forest');
	// expose for quick dev access if needed
	(window as any).__activeEngine = activeEngine;
} catch (e) {
	// ignore in headless/test environments
}
