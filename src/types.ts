export {Viewport, Constants, Block, Position, CubeColor} 
export type { Key, Event, Tetrominos, State, Action, Cube}

/** Constants */

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
} as const;
  
const Constants = {
    TICK_RATE_MS: 100,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,
} as const;

const Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
}


  
  
  
/** User input */

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

/** Utility functions */

/** State processing */

enum CubeColor {
    Red = "red",
    Blue = "blue",
    Green = "green",
    Yellow = "yellow",
}

type Cube = {
    x: number,
    y: number,
    shape: "I" | "J" | "L" | "O" | "S" | "T" | "Z",
    color: CubeColor,
};


// consist of 4 cubes
type Tetrominos = Readonly<{
    cube1: Cube;
    cube2: Cube;
    cube3: Cube;
    cube4: Cube;
}>

type State = Readonly<{
    currentBlock: Tetrominos,
    gameEnd: boolean,
    score: number,
    highScore: number,
    allBlocks: Array<Tetrominos> | null
}>;
  
const Position = {
    SPAWN_POS: {cube1: {x: 100, y: 0, shape: "S", color: CubeColor.Green},
                cube2: {x: 100 - Block.WIDTH, y: 0, shape: "S", color: CubeColor.Green}, 
                cube3: {x: 100, y: Block.HEIGHT, shape: "S", color: CubeColor.Green},
                cube4: {x: 100 - Block.WIDTH, y: Block.HEIGHT, shape: "S", color: CubeColor.Green}
                }
} as const;
/**
 * Actions modify state
 */
interface Action {
    apply(s: State): State;
}