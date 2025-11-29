import { describe, it, expect, vi } from 'vitest';
import Konva from 'konva';
import { MapView } from 'src/main-game/MapView';

function makeMockLayer() {
	return {
		getClassName: vi.fn(() => 'Layer'),
		removeChildren: vi.fn(),
		add: vi.fn(),
		batchDraw: vi.fn(),
	} as unknown as Konva.Layer;
}

function makeMockImage() {
	return {
		width: 64,
		height: 64,
	} as unknown as HTMLImageElement;
}

describe('MapView (Konva path)', () => {
	it('draws background and walls using Konva Layer', () => {
		const bgImg = makeMockImage();
		const view = new MapView(bgImg);
		const layer = makeMockLayer();
		const vp = { x: 0, y: 0, width: 200, height: 150 };
		const walls = [
			{
				id: 'w1',
				minX: 10,
				minY: 10,
				maxX: 30,
				maxY: 30,
				image: { x: vi.fn(), y: vi.fn() },
			},
		];

		view.draw(layer, vp, walls as any);
		expect(layer.removeChildren).toHaveBeenCalled();
		expect(layer.add).toHaveBeenCalled();
		expect(walls[0].image.x).toHaveBeenCalledWith(10 - 0);
		expect(walls[0].image.y).toHaveBeenCalledWith(10 - 0);
		expect(layer.batchDraw).toHaveBeenCalled();
	});
});
