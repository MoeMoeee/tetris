export {Viewport, Constants, Block, BlockType, CubeColor} 
export type { Key, Event, Tetrominos, State, Action, Cube}

/** Constants */

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
} as const;
  
const Constants = {
    TICK_RATE_MS: 20,
    SEED: 1,
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
    LightBlue = "lightblue",
    Purple = "purple",
    Orange = "orange"
}

type Cube = {
    x: number,
    y: number,
    shape: "I" | "J" | "L" | "O" | "S" | "T" | "Z",
    color: CubeColor,
    orientation: number
};

type Tetrominos = Readonly<{
    cube1: Cube | null;
    cube2: Cube | null;
    cube3: Cube | null;
    cube4: Cube | null;
}>

type State = Readonly<{
    currentBlock: Tetrominos,
    gameEnd: boolean,
    score: number,
    highScore: number,
    allBlocks: Array<Tetrominos> | null,
    nextBlock: Tetrominos,
    rowCleared: number
}>;
  
const BlockType = {
    O:  {cube1: {x: 100, y: 0, shape: "S", color: CubeColor.Yellow,  orientation: 0},
        cube2: {x: 100 - Block.WIDTH, y: 0, shape: "S", color: CubeColor.Yellow,  orientation: 0}, 
        cube3: {x: 100, y: Block.HEIGHT, shape: "S", color: CubeColor.Yellow,  orientation: 0},
        cube4: {x: 100 - Block.WIDTH, y: Block.HEIGHT, shape: "S", color: CubeColor.Yellow,  orientation: 0}
        },

    I: {cube1: {x: 100, y: 0, shape: "I", color: CubeColor.LightBlue, orientation: 0},
        cube2: {x: 100 - Block.WIDTH, y: 0, shape: "I", color: CubeColor.LightBlue, orientation: 0}, 
        cube3: {x: 100 + Block.WIDTH, y: 0, shape: "I", color: CubeColor.LightBlue, orientation: 0},
        cube4: {x: 100 - 2*Block.WIDTH, y: 0, shape: "I", color: CubeColor.LightBlue, orientation: 0}
        },

    T: {cube1: {x: 100, y: 0, shape: "T", color: CubeColor.Purple, orientation: 0},
        cube2: {x: 100 - Block.WIDTH, y: 0, shape: "T", color: CubeColor.Purple, orientation: 0}, 
        cube3: {x: 100 + Block.WIDTH, y: 0, shape: "T", color: CubeColor.Purple, orientation: 0},
        cube4: {x: 100  , y: Block.WIDTH, shape: "T", color: CubeColor.Purple, orientation: 0}
        },

    J: {cube1: {x: 100, y: 0, shape: "J", color: CubeColor.Blue, orientation: 0},
        cube2: {x: 100 + Block.WIDTH, y: 0, shape: "J", color: CubeColor.Blue, orientation: 0}, 
        cube3: {x: 100 + 2*Block.WIDTH, y: 0, shape: "J", color: CubeColor.Blue, orientation: 0},
        cube4: {x: 100 + 2*Block.WIDTH, y: Block.WIDTH, shape: "J", color: CubeColor.Blue, orientation: 0}
        },
    
    Z: {cube1: {x: 100, y: 0, shape: "Z", color: CubeColor.Red, orientation: 0},
        cube2: {x: 100 - Block.WIDTH, y: 0, shape: "Z", color: CubeColor.Red, orientation: 0}, 
        cube3: {x: 100, y: Block.WIDTH, shape: "Z", color: CubeColor.Red, orientation: 0},
        cube4: {x: 100 + Block.WIDTH  , y: Block.WIDTH, shape: "Z", color: CubeColor.Red, orientation: 0}
        },

} as const;
/**
 * Actions modify state
 */
interface Action {
    apply(s: State): State;
}
