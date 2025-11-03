import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { View } from "../../types";

type CookingScreenViewOptions = {
  onFinish: () => void;
};

/**
 * Barebones Cooking screen view.
 * Provides a simple background, a label, and a button-like rectangle
 * to trigger `onFinish`.
 */
export class CookingScreenView implements View {
  private group: Group;
  private onFinish: () => void;

  constructor(options: CookingScreenViewOptions) {
    this.onFinish = options.onFinish;
    this.group = new Konva.Group();

    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      fill: "#3b2f2f",
      opacity: 0.85,
    });

    const title = new Konva.Text({
      x: 120,
      y: 140,
      text: "Cooking Station",
      fontSize: 42,
      fill: "#fef3c7",
    });

    const instructions = new Konva.Text({
      x: 120,
      y: 220,
      text: "Placeholder cooking UI. Add minigame elements here.",
      fontSize: 22,
      fill: "#fcd34d",
    });

    const finishButton = new Konva.Rect({
      x: 120,
      y: 320,
      width: 280,
      height: 64,
      cornerRadius: 8,
      fill: "#f97316",
    });

    const finishLabel = new Konva.Text({
      x: 120,
      y: 338,
      width: 280,
      align: "center",
      text: "Finish Cooking",
      fontSize: 26,
      fill: "#fff",
    });

    finishButton.on("click tap", () => this.onFinish());
    finishLabel.on("click tap", () => this.onFinish());

    this.group.add(background);
    this.group.add(title);
    this.group.add(instructions);
    this.group.add(finishButton);
    this.group.add(finishLabel);
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

export default CookingScreenView;
