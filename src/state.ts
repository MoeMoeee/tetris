import { Action, Block, Constants, Cube, State, Tetrominos, Viewport } from "./types";
import {  createTetro, isEndGame } from "./utils";

export { initialState, reduceState, Rotate, Tick, Move, GenerateBlock, Reset}



  
// Define the initial state using the State type
const initialState: State = {
gameEnd: false,
currentBlock: createTetro(0),
score: 0,
highScore: 0,
allBlocks: null,
nextBlock: createTetro(1),
} as const;


class Move implements Action {
  constructor(public readonly moveDistance: number, public readonly axis: string) { } 

  // this function checks if we move the block, will it collide with others
  // we need to account for the move distance of the block when we move
  static iscollideWhenMove = (s: State, moveDistance: number, axis: string): boolean => {
    // this checks when we move block down
    if (axis === 'y') {
      return Object.values(s.currentBlock).some(currCube =>
        s.allBlocks?.some(block =>
          Object.values(block).some(prevCube =>
            currCube!.x === prevCube!.x &&
            currCube!.y + moveDistance + Block.HEIGHT >= prevCube!.y
          )
        )
      );
    }
    // here to check when move block left/right
    else if (axis === 'x') {  
      return Object.values(s.currentBlock).some(currCube =>
        s.allBlocks?.some(block =>
          // here means that the current block cannot be moved left/right
          // if other blocks is occupied
          Object.values(block).some(prevCube =>
            currCube!.x + moveDistance === prevCube!.x && 
            currCube!.y + Block.HEIGHT >= prevCube!.y && 
            currCube!.y - Block.HEIGHT <= prevCube!.y
          )
        )
      );
    }
  
    return false;
  };
  
  // this checks if the block is inside the canvas when we move
  // we need to account for the move distance of the block when we move

  static isBlockInsideScreen = (block: Tetrominos, moveDistance: number, axis: string): boolean => {
    const { cube1, cube2, cube3, cube4 } = block;
  
    if (axis === 'x') {
      // check the boundary of x coordinates
      return (
        (cube1!.x + moveDistance >= 0 && cube1!.x + moveDistance < Viewport.CANVAS_WIDTH - 15) &&
        (cube2!.x + moveDistance >= 0 && cube2!.x + moveDistance < Viewport.CANVAS_WIDTH - 15) &&
        (cube3!.x + moveDistance >= 0 && cube3!.x + moveDistance < Viewport.CANVAS_WIDTH - 15) &&
        (cube4!.x + moveDistance >= 0 && cube4!.x + moveDistance < Viewport.CANVAS_WIDTH - 15)
      );
    } 
    else if (axis === 'y') {
      // check the boundary of x coordinates
      return (
        (cube1!.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
        (cube2!.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
        (cube3!.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
        (cube4!.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15)
      );
    }

    return false;
  };
      
  // here is the action to move the cube left/right/down with certain distance
  static moveCube = ( cube: Cube, moveDistance: number, axis: string) => {
    return {
      ...cube,
      x: axis === 'x' ? cube.x + moveDistance : cube.x,
      y: axis === 'y' ? cube.y + moveDistance : cube.y
    };
  };

  static moveBlock = (s: State, moveDistance: number, axis: string): State => {
    // when we move the block, we need to determine if the move is valid
    // valid means the block will be inside the screen and won't collide with others
    const shouldMoveBlock = () => 
      Move.isBlockInsideScreen(s.currentBlock, moveDistance + 4, axis) && !this.iscollideWhenMove(s, moveDistance, axis);
    
    // execute the move
    const moveCubes = (block: Tetrominos) => ({
      cube1: Move.moveCube(block.cube1!, moveDistance, axis),
      cube2: Move.moveCube(block.cube2!, moveDistance, axis),
      cube3: Move.moveCube(block.cube3!, moveDistance, axis),
      cube4: Move.moveCube(block.cube4!, moveDistance, axis),
    });
    
    // this function checks if the move, then executes the move
    // if it reaches the bottom then we create a new block
    // and return the state of the action move/new block
    const moveOrNewBlock = () => {
      if (shouldMoveBlock()) {
        return { ...s, currentBlock: moveCubes(s.currentBlock) };
      } 
      
      else if (!Move.isBlockInsideScreen(s.currentBlock, moveDistance, axis) && axis === 'y') 
      {
        // create a new block and added the new block to the current block array
        const newBlock = s.nextBlock;
        const allBlocks = s.allBlocks === null ? [s.currentBlock] : [...s.allBlocks, s.currentBlock];
        return { ...s, allBlocks, currentBlock: newBlock };
      } 
      
      // else do nothing
      else {
        return s;
      }
    };
  
    return moveOrNewBlock();
  };
  
  // action function
  apply = (s: State) => {
    return clearRow(isEndGame(Move.moveBlock(s, this.moveDistance, this.axis)));
  };
};

class Tick implements Action {
  static isBlockCollided = (currBlock: Tetrominos, allBlock: Tetrominos): boolean => {
    const isCollision = (cubeA: Cube | null) => (cubeB: Cube | null) =>
      cubeA!.x === cubeB!.x && cubeA!.y + Block.HEIGHT === cubeB!.y;
  
    return Object.values(currBlock).some(currBlock =>
      Object.values(allBlock).some(isCollision(currBlock))
    );
  };

  static detectCollisions = (s: State): State => {
    //check the current block collision vs others
    const collidesWithOtherBlocks = s.allBlocks?.some(existingBlock =>
      Tick.isBlockCollided(s.currentBlock, existingBlock)
    );

    const updatedCurrentBlock = collidesWithOtherBlocks ? s.nextBlock : s.currentBlock;
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
    if (Move.isBlockInsideScreen(s.currentBlock, 5, "y")) {
      const newBlock = {
        cube1: Move.moveCube(s.currentBlock.cube1!, 1, "y"),
        cube2: Move.moveCube(s.currentBlock.cube2!, 1, "y"),
        cube3: Move.moveCube(s.currentBlock.cube3!, 1, "y"),
        cube4: Move.moveCube(s.currentBlock.cube4!, 1, "y"),
      };
      return {
        ...s,
        currentBlock: newBlock  
      };
    }

    else {
      const currentBlock = s.currentBlock;
      const newBlock = s.nextBlock; 

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
    return clearRow(Tick.detectCollisions(isEndGame((Tick.moveTetroDown(s)))));
  };
}


class Rotate implements Action {
  // TODO
  apply = (s: State) => {
    return s;
  };
};

class GenerateBlock implements Action {
  constructor(public readonly random: number) { }


  apply = (s: State) => {    
    const newBlock = createTetro(this.random); // Use the first value in the array
    return { ...s, nextBlock: newBlock };
  };
}


class Reset implements Action {
  // reset action
  // we want to reset the state by setting the new state 
  // as the initial state and keep high score from the previous
  apply = (s: State) => {
    const newState = {
      ...initialState,
      highScore: s.highScore, 
    };

    return newState;
  };
}



const reduceState = (s: State, action: Action) => action.apply(s);

const clearRow = (s: State): State => {
  const { allBlocks } = s;

  if (!allBlocks) {
    return s;
  }

  // Array to keep track of row occupancy
  const rowOccupancy = new Array(Viewport.CANVAS_HEIGHT).fill(0);

  // Update the array if there are blocks in the current row
  allBlocks.forEach((block) => {
    Object.values(block).forEach((cube) => {
      if (cube!.y >= 0) {
        rowOccupancy[cube!.y] += 1;
      }
    });
  });

  // Calculate the number of cleared rows
  const rowToRemove = rowOccupancy.filter((count) => count === Constants.GRID_WIDTH);
  const rowsCleared = rowToRemove.length;

  // Filter out rows that are not fully occupied
  const newAllBlocks = allBlocks.map((block: Tetrominos) => {
    const cubes = Object.values(block).filter((cube) =>
      rowOccupancy[cube!.y] !== Constants.GRID_WIDTH
    );

    return cubes;
  });

  // if we need to clear row, update the allBlocks, current score and 
  if (rowsCleared > 0) {
    const newState = {
      ...s,
      allBlocks: newAllBlocks,
      score: s.score + rowsCleared * 1000, // Update the score based on cleared rows
      highScore: Math.max(s.highScore, s.score + rowsCleared * 1000),
    };

    return newState;
  }

  return s;
};






