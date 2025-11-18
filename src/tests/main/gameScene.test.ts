/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameScene } from 'src/main-game/GameScene';

// create a minimal fake Konva layer with the API our code touches
function makeFakeLayer() {
	return {
		getStage: () => ({}),
		getClassName: () => 'Layer',
		destroyChildren: () => {},
		add: () => {},
		batchDraw: () => {},
		draw: () => {},
	} as any;
}

describe('GameScene callbacks', () => {
	beforeEach(() => {
		// provide a simple requestAnimationFrame shim so the loop runs once
		(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
			return setTimeout(() => cb(Date.now()), 0) as unknown as number;
		};
		(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id as any);
	});

	it('calls onPlayerDeath when health <= 0', async () => {
		const onDeath = vi.fn();
		const layer = makeFakeLayer();
		const scene = new GameScene(layer, { onPlayerDeath: onDeath });
		scene.start();
		// set health to 0 to trigger death
		scene.getPlayerModel().setHealth(0);
		// wait a tick for the animation loop to run
		await new Promise((r) => setTimeout(r, 20));
		expect(onDeath).toHaveBeenCalled();
		scene.stop();
	});

	it('calls onLevelComplete when experience >= 100', async () => {
		const onComplete = vi.fn();
		const layer = makeFakeLayer();
		const scene = new GameScene(layer, { onLevelComplete: onComplete });
		scene.start();
		// set experience to 100 to trigger level complete
		scene.getPlayerModel().setExperience(100);
		await new Promise((r) => setTimeout(r, 20));
		expect(onComplete).toHaveBeenCalled();
		scene.stop();
	});
});
