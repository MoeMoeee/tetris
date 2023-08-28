import { Action, Block, State, Tetrominos, Viewport } from "./types";
import { createTetro, generateNewBlock } from "./utils";

export { initialState, reduceState, Rotate, Tick, Move }



  
// Define the initial state using the State type
const initialState: State = {
gameEnd: false,
currentBlock: createTetro(),
score: 0,
highScore: 0,
allBlocks: null,
} as const;


class Move implements Action {
  constructor(public readonly moveDistance: number, public readonly axis: string) { } 

  static isBlockInsideScreen = (s: State, moveDistance: number, axis: string): boolean => {
    const { cube1, cube2, cube3, cube4 } = s.currentBlock;
  
    if (axis === 'x') {
      return (
        (cube1.x + moveDistance >= 0 && cube1.x + moveDistance < Viewport.CANVAS_WIDTH - 15) &&
        (cube2.x + moveDistance >= 0 && cube2.x + moveDistance < Viewport.CANVAS_WIDTH - 15) &&
        (cube3.x + moveDistance >= 0 && cube3.x + moveDistance < Viewport.CANVAS_WIDTH - 15) &&
        (cube4.x + moveDistance >= 0 && cube4.x + moveDistance < Viewport.CANVAS_WIDTH - 15)
      );
    } 
    else if (axis === 'y') {
      return (
        (cube1.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
        (cube2.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
        (cube3.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
        (cube4.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15)
      );
    }

    return false;
  };
      

  static moveCube = (s: State, cube: { x: number; y: number }, moveDistance: number, axis: string) => {
    return {
      x: axis === 'x' ? cube.x + moveDistance : cube.x,
      y: axis === 'y' ? cube.y + moveDistance : cube.y
    };
  };

  static moveBlock = (s: State, moveDistance: number, axis: string): State => {
    if (Move.isBlockInsideScreen(s, moveDistance+4, axis)) {
      const newBlock = {
        cube1: Move.moveCube(s, s.currentBlock.cube1, moveDistance, axis),
        cube2: Move.moveCube(s, s.currentBlock.cube2, moveDistance, axis),
        cube3: Move.moveCube(s, s.currentBlock.cube3, moveDistance, axis),
        cube4: Move.moveCube(s, s.currentBlock.cube4, moveDistance, axis),
      };
      return {
        ...s,
        currentBlock: newBlock  
      };
    } 

    else if (!Move.isBlockInsideScreen(s, moveDistance, axis) && axis === 'y') {
      const currentBlock = s.currentBlock;
      const newBlock = generateNewBlock(s); 

      return {
        ...s,
        allBlocks: s.allBlocks === null ? [s.currentBlock] : [...s.allBlocks, currentBlock],
        currentBlock: newBlock  
      };
    }
    
    else {
      const newBlock = s.currentBlock; 
      return {
        ...s,
        currentBlock: newBlock  
      };
    }

  }

  apply = (s: State) => {
    return Tick.detectCollisions(Move.moveBlock(s, this.moveDistance, this.axis));
  };
};

class Rotate implements Action {

  // TODO
  apply = (s: State) => {
    return s;
  };
};



class Tick implements Action {
  static isblockCollided = (blockA: Tetrominos, blockB: Tetrominos): boolean => {
    return Object.values(blockA).some(cubeA =>
      Object.values(blockB).some(cubeB =>
        cubeA.x === cubeB.x  && cubeA.y + Block.HEIGHT === cubeB.y
      )
    );
  };

  static detectCollisions = (s: State): State => {
    //check the current block collision vs others
    const collidesWithOtherBlocks = s.allBlocks?.some(existingBlock =>
      Tick.isblockCollided(s.currentBlock, existingBlock)
    );


    const updatedCurrentBlock = collidesWithOtherBlocks ? generateNewBlock(s) : s.currentBlock;
    const updatedAllBlocks = collidesWithOtherBlocks
      ? (s.allBlocks || []).concat(s.currentBlock)
      : s.allBlocks;
  
    return {
      ...s,
      currentBlock: updatedCurrentBlock,
      allBlocks: updatedAllBlocks
    };
  }

  static moveTetroDown = (s: State): State => {
    if (Move.isBlockInsideScreen(s, 5, "y")) {
      const newBlock = {
        cube1: Move.moveCube(s, s.currentBlock.cube1, 1, "y"),
        cube2: Move.moveCube(s, s.currentBlock.cube2, 1, "y"),
        cube3: Move.moveCube(s, s.currentBlock.cube3, 1, "y"),
        cube4: Move.moveCube(s, s.currentBlock.cube4, 1, "y"),
      };
      return {
        ...s,
        currentBlock: newBlock  
      };
    }

    else {
      const currentBlock = s.currentBlock;
      const newBlock = generateNewBlock(s); 

      return {
        ...s,
        allBlocks: s.allBlocks === null ? [s.currentBlock] : [...s.allBlocks, currentBlock],
        currentBlock: newBlock  
      };
    }
  };
    
  

  /**
   * Updates the state by proceeding with one time step.
   *
   * @param s Current state
   * @returns Updated state
     */
  apply = (s: State) => {
    return Tick.detectCollisions(Tick.moveTetroDown(s));
  };
}


const reduceState = (s: State, action: Action) => action.apply(s);
