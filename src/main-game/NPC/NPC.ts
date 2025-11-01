
import { MapToNextDirection } from '../types';
import { Player } from './types';


export class NPC extends Player{

    public is_chasing: boolean;

    constructor(){
        super();
        this.is_chasing = false;
    }

    private incrDirection(): void{
        this.direction = MapToNextDirection.get(this.direction)!;
    }

    public startChase(): void {
        this.is_chasing = true;
    }

    public animate(): void {
        if (!this.is_chasing){
            this.incrDirection();
        }
    }
}