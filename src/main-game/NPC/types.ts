import { Position, Direction, Species, DEF_PXL_ADV, MapToNextDirection } from "../types";


export abstract class Player{
    public position: Position
    public width: number
    public height: number
    protected direction: Direction
    protected species: Species

    constructor(species: Species = Species.SPEC1, 
                position: Position = {x: 0, y: 0},
                width: number = 32, 
                height: number = 32){
        this.position = position;
        this.direction = Direction.Down;
        this.species = species;
        this.width = width
        this.height = height;
    }

    public getPosition(): Position{
        return this.position;
    }

    public getDirection(): Direction{
        return this.direction;
    }

    private updateDirection(new_direction: Direction): void {
        this.direction = new_direction;
    }
    
    public getNextDirection(): Direction{
        return MapToNextDirection.get(this.direction)!;
    }

    public setNextDirection(): void{
        this.direction = this.getNextDirection()!;
    }

    public moveUp(pixels: number = DEF_PXL_ADV, set_dir: boolean = false) {
        this.position.y -= pixels;
        if (set_dir){
            this.updateDirection(Direction.Up);
        }
    }
    public moveDown(pixels: number = DEF_PXL_ADV, set_dir: boolean = false) {
        this.position.y += pixels;
        if (set_dir){
        this.updateDirection(Direction.Down);
        }
    }
    public moveLeft(pixels: number = DEF_PXL_ADV, set_dir: boolean = false) {
        this.position.x -= pixels;
        if (set_dir){
            this.updateDirection(Direction.Left);
        }
    }
    public moveRight(pixels: number = DEF_PXL_ADV, set_dir: boolean = false) {
        this.position.x += pixels;
        if (set_dir){
            this.updateDirection(Direction.Right);
    
        }
    }
}