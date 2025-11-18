/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';

// mock GameScene so we can observe constructor options
vi.mock('src/main-game/GameScene', () => {
	return {
		GameScene: class {
			constructor(layer: any, opts: any) {
				// store last options on global so test can inspect
				(globalThis as any).__lastGameSceneOpts = opts;
			}
			start() {}
			stop() {}
		},
	};
});

import { startGame } from 'src/main-game/gameplay';

describe('gameplay.startGame simple level start', () => {
	it('creates first level GameScene with levelNumber 1', async () => {
		const container = document.createElement('div');
		document.body.appendChild(container);

		const handle = await startGame(container);
		// the mocked GameScene stored its options on global
		const opts = (globalThis as any).__lastGameSceneOpts;
		expect(opts).toBeDefined();
		expect(opts.levelNumber).toBe(1);
		// species should be defined
		expect(opts.species).toBeDefined();

		// cleanup
		handle.stop();
		document.body.removeChild(container);
	});
});
