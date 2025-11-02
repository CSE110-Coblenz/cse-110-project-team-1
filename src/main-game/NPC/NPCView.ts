import Konva from 'konva';
import { View } from '../types'; // adjust path as needed
import { NPC_RED} from '../types'; // assuming your color constant
import { NPC } from './NPC';

export class NPCView extends View {

  constructor(layer: Konva.Layer) {
    super(layer);
  }

  public updateNPCShapes(npcs: NPC[]): void {
    this.destroyShapes();
    const shapes: Konva.Rect[] = []
    console.log("Updating NPC shapes for:", npcs);
    npcs.forEach((npc) => {
        const shape = new Konva.Rect({
            x: npc.position.x,
            y: npc.position.y,
            width: npc.width,
            height: npc.height,
            fill: NPC_RED,
            });
        shapes.push(shape);
    });
    this.shapes = shapes
    for (const shape of this.shapes) {
        this.layer.add(shape);
    }
  }

  public draw(): void {
    super.draw();
    console.log("NPCView drawn");
  }

}
