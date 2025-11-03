import Konva from 'konva';
import { View } from '../types'; // adjust path as needed
import { NPCModel } from './NPCModel';

import { PlayerView } from '../PlayerView';


export class NPCView extends PlayerView{

}

// export class NPCView extends View {

//   private static NPC_RED = '#FF0000'; // red box

//   public changeNPCView(npc_model: NPCModel[]): void {
//     this.destroyShapes();
//     const shape = new Konva.Rect({
//         x: npc_model.position.x,
//         y: npc_model.position.y,
//         width: npc_model.width,
//         height: npc_model.height,
//         fill: NPCView.NPC_RED,
//         });
//     this.shapes.push(shape);
//     this.AddShapes();
//   }

// }