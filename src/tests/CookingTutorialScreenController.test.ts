import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Screen } from 'src/types';

// Mock Konva minimally - must be inside factory
vi.mock('konva', () => {
	const mockImageHandlers: Record<string, Function[]> = {};
	const mockImageInstance = {
		on: (evt: string, cb: Function) => {
			(mockImageHandlers[evt] ||= []).push(cb);
		},
		image: () => {},
	};

	const mockGroupInstance = {
		add: () => {},
		visible: () => {},
		remove: () => {},
		destroy: () => {},
	};

	return {
		default: {
			Image: function () {
				return mockImageInstance;
			},
			Group: function () {
				return mockGroupInstance;
			},
		},
		__mockImageHandlers: mockImageHandlers,
	};
});

// Import after mocks
import { CookingTutorialScreenController } from 'src/screens/CookingTutorialScreen/CookingTutorialScreenController';
import { GameScreenController } from 'src/screens/GameScreen/GameScreenController';

describe('CookingTutorialScreenController', () => {
	afterEach(() => {
		// reset static flag between tests
		(GameScreenController as any).tutorialSeen = false;
		vi.clearAllMocks();
	});

	it('clicking tutorial image sets tutorialSeen and routes to cooking', async () => {
		const screenSwitcher = { switchToScreen: vi.fn<(screen: Screen) => void>() };
		const species: any[] = [{ id: 'test' }];
		const controller = new CookingTutorialScreenController(
			screenSwitcher as any,
			species as any,
			2,
			0,
		);

		// mount with mock layer/stage
		const stage = { show: vi.fn(), width: () => 800, height: () => 600 } as any;
		const layer = { getStage: () => stage, add: vi.fn(), batchDraw: vi.fn() } as any;
		controller.mount(layer);

		// Simulate click on the image
		const konvaMock = await import('konva');
		const handlers = (konvaMock as any).__mockImageHandlers;
		const clickHandler = handlers['click tap']?.[0];
		expect(clickHandler).toBeDefined();
		clickHandler();

		expect((GameScreenController as any).tutorialSeen).toBe(true);
		expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
			type: 'cooking',
			species,
			nextLevel: 2,
			speedBoost: 0,
		});
	});
});
