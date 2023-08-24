export {Viewport, Constants, Block} 
export type { Key, Event, Tetrominos, State}

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
  } as const;
  
  const Constants = {
    TICK_RATE_MS: 500,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,
  } as const;
  
  const Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
  };
  
  
  
  /** User input */
  
  type Key = "KeyS" | "KeyA" | "KeyD";
  
  type Event = "keydown" | "keyup" | "keypress";
  
  /** Utility functions */
  
  /** State processing */
  
  // consist of 4 cubes
  type Tetrominos = {
    cube1: { x: number; y: number };
    cube2: { x: number; y: number };
    cube3: { x: number; y: number };
    cube4: { x: number; y: number };
  }
  
  type State = Readonly<{
    currentBlock: Tetrominos,
    gameEnd: boolean;
  }>;
  
  