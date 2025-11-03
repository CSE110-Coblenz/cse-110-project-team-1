import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { View } from "../../types";

export class MenuScreenView implements View {
  private group: Group;

  constructor() {
    this.group = new Konva.Group();

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      fill: "#123456",
      opacity: 0.8,
    });

    const label = new Konva.Text({
      x: 100,
      y: 100,
      text: "MENU",
      fontSize: 48,
      fill: "#fff",
    });

    this.group.add(bg);
    this.group.add(label);
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

export default MenuScreenView;
