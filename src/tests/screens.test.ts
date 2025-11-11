/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { MenuScreenController } from '../screens/MenuScreen/MenuScreenController';
import { VictoryScreenController } from '../screens/VictoryScreen/VictoryScreenController';
import { DeathScreenController } from '../screens/DeathScreen/DeathScreenController';

describe('Screen controllers (simplified behavior tests)', () => {
    it('MenuScreenController triggers intro on Start', () => {
        const screenSwitcher = { switchToScreen: vi.fn() } as any;
        const controller = new MenuScreenController(screenSwitcher);
        const group: any = controller.getView().getGroup();
        // find the button rect and simulate a click (Konva node API)
        const rect = group.findOne && group.findOne('Rect');
        if (rect && typeof rect.fire === 'function') rect.fire('click');
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: 'intro' });
    });

    it('VictoryScreenController triggers menu on Play Again', () => {
        const screenSwitcher = { switchToScreen: vi.fn() } as any;
        const controller = new VictoryScreenController(screenSwitcher, 10);
        const group: any = controller.getView().getGroup();
        const rect = group.findOne && group.findOne('Rect');
        if (rect && typeof rect.fire === 'function') rect.fire('click');
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: 'menu' });
    });

    it('DeathScreenController triggers menu on Play Again', () => {
        const screenSwitcher = { switchToScreen: vi.fn() } as any;
        const controller = new DeathScreenController(screenSwitcher, 0);
        const group: any = controller.getView().getGroup();
        const rect = group.findOne && group.findOne('Rect');
        if (rect && typeof rect.fire === 'function') rect.fire('click');
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: 'menu' });
    });
});
