import { startGame, GameHandle } from './main-game/index';

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
        app.appendChild(back);
    });

    const mini1 = createButton('MiniGame A (placeholder)', () => alert('MiniGame A not implemented'));
    const mini2 = createButton('MiniGame B (placeholder)', () => alert('MiniGame B not implemented'));

    app.appendChild(playBtn);
    app.appendChild(document.createElement('br'));
    app.appendChild(mini1);
    app.appendChild(mini2);
}

// start
showMainMenu();
