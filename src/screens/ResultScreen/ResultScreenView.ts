import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { View } from "../../types";

export class ResultScreenView implements View {
  private group: Group;
  private label: Konva.Text;

  constructor(score?: number) {
    this.group = new Konva.Group();

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      fill: "#220000",
      opacity: 0.9,
    });

    this.label = new Konva.Text({
      x: 100,
      y: 100,
      text: `RESULT: ${score ?? 0}`,
      fontSize: 36,
      fill: "#fff",
    });

    this.group.add(bg);
    this.group.add(this.label);
  }

  setScore(score: number) {
    this.label.text(`RESULT: ${score}`);
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

export default ResultScreenView;
