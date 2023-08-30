export {Viewport, Constants, Block, Position} 
export type { Key, Event, Tetrominos, State, Action}

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

const Position = {
    SPAWN_POS: {cube1: {x: 100, y: 0},
                cube2: {x: 100 - Block.WIDTH, y: 0}, 
                cube3: {x: 100, y: Block.HEIGHT},
                cube4: {x: 100 - Block.WIDTH, y: Block.HEIGHT}
                }
} as const;
  
  
  
/** User input */

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

/** Utility functions */

/** State processing */
type Cube = {
    x: number,
    y: number,
    shape: "I" | "J" | "L" | "O" | "S" | "T" | "Z"
}

// consist of 4 cubes
type Tetrominos = Readonly<{
    cube1: { x: number; y: number };
    cube2: { x: number; y: number };
    cube3: { x: number; y: number };
    cube4: { x: number; y: number };
}>

type State = Readonly<{
    currentBlock: Tetrominos,
    gameEnd: boolean,
    score: number,
    highScore: number,
    allBlocks: Array<Tetrominos> | null
}>;
  
/**
 * Actions modify state
 */
interface Action {
    apply(s: State): State;
}