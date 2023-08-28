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
        (cube1.y + moveDistance >= 0 && cube1.y + moveDistance <= Viewport.CANVAS_HEIGHT - 17) &&
        (cube2.y + moveDistance >= 0 && cube2.y + moveDistance <= Viewport.CANVAS_HEIGHT - 17) &&
        (cube3.y + moveDistance >= 0 && cube3.y + moveDistance <= Viewport.CANVAS_HEIGHT - 17) &&
        (cube4.y + moveDistance >= 0 && cube4.y + moveDistance <= Viewport.CANVAS_HEIGHT - 17)
      );
    }

    return false;
  };
      

  static moveCube = (s: State, cube: { x: number; y: number }, moveDistance: number, axis: string) => {
    return {
      x: axis === 'x' ? cube.x + moveDistance: cube.x,
      y: axis === 'y' ? cube.y + moveDistance : cube.y
    };
  };

  static moveBlock = (s: State, moveDistance: number, axis: string): State => {
    if (Move.isBlockInsideScreen(s, moveDistance, axis)) {
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
  

        
    

  // apply = (s: State) => {
  //   const updatedBlock = {
  //     ...s,
  //     currentBlock: Move.moveBlock(s, this.moveDistance, this.axis)
  //     };

  //   return updatedBlock;
  // };

  apply = (s: State) => {
    return Move.moveBlock(s, this.moveDistance, this.axis)
  };
};

class Rotate implements Action {

  // TODO
  apply = (s: State) => {
    const updatedState = {
    ...s,
    currentBlock: Tick.moveTetroDown(s),
    };

    return updatedState;
  };
};



class Tick implements Action {
  static moveTetroDown = (s: State) => (
    Move.isBlockInsideScreen(s, 5, "y") ? {
      cube1: { x: s.currentBlock.cube1.x, y: s.currentBlock.cube1.y + 1 },
      cube2: { x: s.currentBlock.cube2.x, y: s.currentBlock.cube2.y + 1 },
      cube3: { x: s.currentBlock.cube3.x, y: s.currentBlock.cube3.y + 1 },
      cube4: { x: s.currentBlock.cube4.x, y: s.currentBlock.cube4.y + 1 },
    } : s.currentBlock
  );
    
  // static handleCollisions = (s: State): State => s; //TODO

  /**
   * Updates the state by proceeding with one time step.
   *
   * @param s Current state
   * @returns Updated state
     */
  apply = (s: State) => {
    const updatedState = {
    ...s,
    currentBlock: Tick.moveTetroDown(s),
    };

    return updatedState;
  };

}


const reduceState = (s: State, action: Action) => action.apply(s);
