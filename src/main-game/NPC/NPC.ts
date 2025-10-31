
import { Position } from '../types';


export class NPC{
    private position: Position


    constructor(input_position: Position){
        this.position = input_position;
    }

    public updatePosition(new_position: Position): void {
        this.position = new_position;
    }

    public getPosition(): Position {
        return this.position;
    }
}