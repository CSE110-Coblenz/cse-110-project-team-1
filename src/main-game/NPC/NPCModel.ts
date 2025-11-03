import { Direction } from '../types';
import { PlayerModel } from '../PlayerModel';


export class NPCModel extends PlayerModel{

    private is_idle: boolean = true;

    private static NextDirection = new Map<Direction, Direction>([
      [Direction.Up, Direction.Left],
      [Direction.Left, Direction.Down],
      [Direction.Down, Direction.Right],
      [Direction.Right, Direction.Up],
    ]);

    private static DirectionToDelta = new Map<Direction, [number, number]>([
        [Direction.Up, [0, PlayerModel.DEFAULT_ADVANCE]],      // move up (y decreases)
        [Direction.Down, [0, -PlayerModel.DEFAULT_ADVANCE]],     // move down (y increases)
        [Direction.Left, [-PlayerModel.DEFAULT_ADVANCE, 0]],    // move left (x decreases)
        [Direction.Right, [PlayerModel.DEFAULT_ADVANCE, 0]],    // move right (x increases)
        ]);
    
    private static ReverseNextDirection = new Map<Direction, Direction>([
      [Direction.Up, Direction.Right],
      [Direction.Right, Direction.Down],
      [Direction.Down, Direction.Left],
      [Direction.Left, Direction.Up],
    ]);

    private animation_map = Math.random() < 0.5 ? NPCModel.NextDirection : NPCModel.ReverseNextDirection;

    public animate(){
        if(this.is_idle){
            this.circle();
        }
    }

    public circle(){
        this.direction = this.animation_map.get(this.direction)!;
        this.moveBy(...NPCModel.DirectionToDelta.get(this.direction)!); 
    }

}