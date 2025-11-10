import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { View } from "../../types";

type IntroScreenOptions = {
  onContinue: () => void;
};

/**
 * Minimal intro/tutorial view.
 * Displays a simple overlay with text and a button-like rectangle that
 * triggers `onContinue` when clicked/tapped.
 */
export class IntroScreenView implements View {
  private group: Group;
  private onContinue: () => void;

  constructor(options: IntroScreenOptions) {
    this.onContinue = options.onContinue;
    this.group = new Konva.Group();

    // background image for story/intro
    const bgImgEl = new Image();
    bgImgEl.src = "background.png";
    const backdrop = new Konva.Image({
      x: 0,
      y: 0,
      height: window.innerHeight * 0.95,
      width: window.innerWidth * 0.95,
      image: undefined as unknown as HTMLImageElement,
    });
    bgImgEl.onload = () => {
      try {
        backdrop.image(bgImgEl);
        const layer = backdrop.getLayer();
        if (layer) layer.batchDraw();
      } catch (e) {
        // ignore
      }
    };

    const title = new Konva.Text({
      x: 120,
      y: 120,
      text: "Welcome to the Tutorial",
      fontSize: 36,
      fill: "#ffffff",
    });

    const instructions = new Konva.Text({
      x: 120,
      y: 200,
      text: "Quick overview of the gameplay goes here.",
      fontSize: 24,
      fill: "#dddddd",
    });

    const continueButton = new Konva.Rect({
      x: 120,
      y: 320,
      width: 260,
      height: 60,
      cornerRadius: 8,
      fill: "#4caf50",
    });

    const continueLabel = new Konva.Text({
      x: 120,
      y: 340,
      width: 260,
      align: "center",
      text: "Start Game",
      fontSize: 24,
      fill: "#ffffff",
    });

    continueButton.on("click tap", () => this.onContinue());
    continueLabel.on("click tap", () => this.onContinue());

    this.group.add(backdrop);
    this.group.add(title);
    this.group.add(instructions);
    this.group.add(continueButton);
    this.group.add(continueLabel);
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

export default IntroScreenView;
