import { startGame, GameHandle } from 'src/main-game/gameplay';
import { Game } from 'src/game-engine';

// Simple single-page main menu
const app = document.getElementById('app') || document.body;

function createButton(text: string, onClick: () => void) {
	const btn = document.createElement('button');
	btn.textContent = text;
	btn.className = 'menu-button';
	btn.addEventListener('click', onClick);
	return btn;
}

let activeHandle: GameHandle | null = null;
let activeEngine: Game | null = null;

function showMainMenu() {
	if (app instanceof HTMLBodyElement) app.innerHTML = '';
	else app.innerHTML = '';
	const title = document.createElement('h1');
	title.textContent = 'CSE110 Game Hub';
	app.appendChild(title);

	const playBtn = createButton('Play Main Game', async () => {
		// mount the main game into the app and hide menu
		app.innerHTML = '';
		activeHandle = await startGame(app);

		// show back button
		const back = createButton('Back to Menu', () => {
			if (activeHandle) {
				activeHandle.stop();
				activeHandle = null;
			}
			showMainMenu();
		});
		const next = createButton('Next Level', async () => {
			if (activeHandle) {
				activeHandle.stop();
				activeHandle = null;
			}
			activeHandle = await startGame(app);
		});
		app.appendChild(back);
		app.appendChild(next);
	});

	const mini1 = createButton('MiniGame A (placeholder)', () =>
		alert('MiniGame A not implemented'),
	);
	const mini2 = createButton('MiniGame B (placeholder)', () =>
		alert('MiniGame B not implemented'),
	);

	app.appendChild(playBtn);
	// quick access to the new game-engine flow (future primary option)
	const engineBtn = createButton('Start Engine (dev)', () => {
		// mount engine container and start engine
		app.innerHTML = '';
		const container = document.createElement('div');
		container.id = 'container';
		container.style.width = '100%';
		container.style.height = '100%';
		app.appendChild(container);

		// create and start the engine with placeholder params
		activeEngine = new Game(3, 'easy', 'forest');

		const back = createButton('Back to Menu', () => {
			try {
				activeEngine?.end();
			} catch (e) {
				/* ignore */
			}
			activeEngine = null;
			showMainMenu();
		});
		const gameOver = createButton('Trigger Game Over', () => {
			try {
				activeEngine?.end();
			} catch (e) {
				/* ignore */
			}
			activeEngine?.gameOver();
		});
		const victory = createButton('Trigger Victory', () => {
			try {
				activeEngine?.end();
			} catch (e) {
				/* ignore */
			}
			activeEngine?.victory();
		});
		app.appendChild(back);
		app.appendChild(gameOver);
		app.appendChild(victory);
	});
	app.appendChild(engineBtn);
	app.appendChild(document.createElement('br'));
	app.appendChild(mini1);
	app.appendChild(mini2);
}

// start
showMainMenu();
