
import { MapToNextDirection, ReverseMapToNextDirection, Direction } from '../types';
import { Player } from './types';


export class NPC extends Player{
    public is_chasing: boolean;
    private animation_map: Map<Direction, Direction>;

    constructor(){
        super();
        this.is_chasing = false;
        this.animation_map = Math.random() < 0.5 ? MapToNextDirection : ReverseMapToNextDirection;
    }

    private incrDirection(): void{
        this.direction = this.animation_map.get(this.direction)!;
    }

    public startChase(): void {
        this.is_chasing = true;
    }

    public animate(): void {
        if (!this.is_chasing){
            this.incrDirection();
        }
        if (this.direction == Direction.Up) {
            this.moveUp();
        } else if (this.direction == Direction.Down) {
            this.moveDown();
        } else if (this.direction == Direction.Left) {
            this.moveLeft();
        } else if (this.direction == Direction.Right) {
            this.moveRight();
        }
    }
}