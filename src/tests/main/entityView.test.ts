import { describe, it, expect, vi } from 'vitest';
import { EntityView } from 'src/main-game/EntityView';

describe('EntityView.undraw', () => {
    it('destroys the circle and clears the reference', () => {
        const v = new EntityView();
        let destroyed = false;
        // inject a mock circle with a destroy() spy
        (v as any).circle = { destroy: () => { destroyed = true; } };

        v.undraw();
        expect(destroyed).toBe(true);
        expect((v as any).circle).toBeNull();
    });
});
