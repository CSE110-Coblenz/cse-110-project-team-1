import Konva from 'konva';
import type { Group } from 'konva/lib/Group';
import type { View } from 'src/types';

export class VictoryScreenView implements View {
    private group: Group;
    private title: Konva.Text;
    private playAgainButton: Konva.Rect;
    private playAgainLabel: Konva.Text;

    constructor(score?: number, options?: { onPlayAgain?: () => void }) {
        this.group = new Konva.Group();

        const img = new Image();
        img.src = 'victory_bg.png';
        const bg = new Konva.Image({
            x: 0,
            y: 0,
            height: window.innerHeight * 0.95,
            width: window.innerWidth * 0.95,
            image: undefined as unknown as HTMLImageElement,
        });
        img.onload = () => {
            try {
                bg.image(img);
                const layer = bg.getLayer();
                if (layer) layer.batchDraw();
            } catch (e) { }
        };

        this.title = new Konva.Text({
            x: (window.innerWidth * 0.95) / 2,
            y: 100,
            text: `Congratulations! You've Survived!`,
            fontSize: 48,
            fill: 'black',
            align: 'center',
            fontFamily: 'bold',
        });
        this.title.offsetX(this.title.width() / 2);

        // play again button (view positions and renders it)
        const centerX = (window.innerWidth * 0.95) / 2;
        this.playAgainButton = new Konva.Rect({
            x: centerX,
            y: 220,
            width: 240,
            height: 56,
            cornerRadius: 8,
            fill: '#1976d2',
        });
        this.playAgainButton.offsetX(this.playAgainButton.width() / 2);

        this.playAgainLabel = new Konva.Text({
            x: centerX,
            y: 236,
            width: 240,
            align: 'center',
            text: 'Play Again',
            fontSize: 24,
            fill: '#ffffff',
        });
        this.playAgainLabel.offsetX(this.playAgainLabel.width() / 2);

        // If an onPlayAgain handler is provided, wire the button to call it.
        if (options?.onPlayAgain) {
            this.playAgainButton.on(
                'click tap',
                () => options.onPlayAgain && options.onPlayAgain(),
            );
            this.playAgainLabel.on('click tap', () => options.onPlayAgain && options.onPlayAgain());
        }

        this.group.add(bg);
        this.group.add(this.title);
        this.group.add(this.playAgainButton);
        this.group.add(this.playAgainLabel);
    }

    /**
     * Register a handler to be called when the Play Again button is clicked.
     * The view owns the DOM/Konva nodes and is responsible for rendering/positioning.
     */
    setOnPlayAgain(handler: () => void) {
        // remove any previous listeners to avoid duplicates
        try {
            this.playAgainButton.off('click tap');
            this.playAgainLabel.off('click tap');
        } catch (e) {
            // ignore if not yet attached
        }
        this.playAgainButton.on('click tap', handler);
        this.playAgainLabel.on('click tap', handler);
    }

    getGroup(): Group {
        return this.group;
    }

    show(): void {
        this.group.visible(true);
    }

    hide(): void {
        this.group.visible(false);
    }
}

export default VictoryScreenView;
