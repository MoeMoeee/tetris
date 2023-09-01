import { Action, Block, Constants, Cube, Position, State, Tetrominos, Viewport } from "./types";
import {  createTetro, isEndGame } from "./utils";

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

  static iscollideWhenMove = (s: State, moveDistance: number, axis: string): boolean => {
    if (axis === 'y') {
      return Object.values(s.currentBlock).some(currCube =>
        s.allBlocks?.some(block =>
          Object.values(block).some(prevCube =>
            currCube.x === prevCube.x &&
            currCube.y + moveDistance + Block.HEIGHT >= prevCube.y
          )
        )
      );
    }
    else if (axis === 'x') {
      
      return Object.values(s.currentBlock).some(currCube =>
        s.allBlocks?.some(block =>
          Object.values(block).some(prevCube =>
            currCube.x + moveDistance === prevCube.x && 
            currCube.y + Block.HEIGHT >= prevCube.y && 
            currCube.y - Block.HEIGHT <= prevCube.y
          )
        )
      );
    }
  
    return false;
  };
  

  static isBlockInsideScreen = (block: Tetrominos, moveDistance: number, axis: string): boolean => {
    const { cube1, cube2, cube3, cube4 } = block;
  
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
      

  static moveCube = ( cube: Cube, moveDistance: number, axis: string) => {
    return {
      ...cube,
      x: axis === 'x' ? cube.x + moveDistance : cube.x,
      y: axis === 'y' ? cube.y + moveDistance : cube.y
    };
  };

  static moveBlock = (s: State, moveDistance: number, axis: string): State => {
    const shouldMoveBlock = () => 
      Move.isBlockInsideScreen(s.currentBlock, moveDistance + 4, axis) && !this.iscollideWhenMove(s, moveDistance, axis);
  
    const moveCubes = (block: Tetrominos) => ({
      cube1: Move.moveCube(block.cube1, moveDistance, axis),
      cube2: Move.moveCube(block.cube2, moveDistance, axis),
      cube3: Move.moveCube(block.cube3, moveDistance, axis),
      cube4: Move.moveCube(block.cube4, moveDistance, axis),
    });
  
    const moveOrNewBlock = () => {
      if (shouldMoveBlock()) {
        return { ...s, currentBlock: moveCubes(s.currentBlock) };
      } 
      
      else if (!Move.isBlockInsideScreen(s.currentBlock, moveDistance, axis) && axis === 'y') 
      {
        const newBlock = createTetro();
        const allBlocks = s.allBlocks === null ? [s.currentBlock] : [...s.allBlocks, s.currentBlock];
        return { ...s, allBlocks, currentBlock: newBlock };
      } 
      
      else {
        return s;
      }
    };
  
    return moveOrNewBlock();
  };
  

  apply = (s: State) => {
    return clearRow(isEndGame(Move.moveBlock(s, this.moveDistance, this.axis)));
  };
};

class Tick implements Action {
  static isBlockCollided = (currBlock: Tetrominos, allBlock: Tetrominos): boolean => {
    const isCollision = (cubeA: { x: number; y: number }) => (cubeB: { x: number; y: number }) =>
      cubeA.x === cubeB.x && cubeA.y + Block.HEIGHT === cubeB.y;
  
    return Object.values(currBlock).some(currBlock =>
      Object.values(allBlock).some(isCollision(currBlock))
    );
  };

  static detectCollisions = (s: State): State => {
    //check the current block collision vs others
    const collidesWithOtherBlocks = s.allBlocks?.some(existingBlock =>
      Tick.isBlockCollided(s.currentBlock, existingBlock)
    );

    const updatedCurrentBlock = collidesWithOtherBlocks ? createTetro() : s.currentBlock;
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
        cube1: Move.moveCube(s.currentBlock.cube1, 1, "y"),
        cube2: Move.moveCube(s.currentBlock.cube2, 1, "y"),
        cube3: Move.moveCube(s.currentBlock.cube3, 1, "y"),
        cube4: Move.moveCube(s.currentBlock.cube4, 1, "y"),
      };
      return {
        ...s,
        currentBlock: newBlock  
      };
    }

    else {
      const currentBlock = s.currentBlock;
      const newBlock = createTetro(); 

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

const reduceState = (s: State, action: Action) => action.apply(s);


// To know which row we need to remove, we need to check how many cubes 
// are in an y-axis across all CANVAS_HEIGHT
// After clear the row, we also need to drop down the stacked blocks 
// and increment the score 
const clearRow = (s: State): State => {
  const { allBlocks } = s;

  if (!allBlocks) {
    return s;
  }

  const rowOccupancy = new Array(Viewport.CANVAS_HEIGHT).fill(0);

  allBlocks.forEach((block) => {
    Object.values(block).forEach((cube) => {
      if (cube.y >= 0) {
        rowOccupancy[cube.y] += 1;
      }
    });
  });

  const newAllBlocks = allBlocks.filter((block: Tetrominos) =>
    !Object.values(block).every((cube) =>
      cube.y >= 0 && rowOccupancy[cube.y] === Constants.GRID_WIDTH
    )
  );

  if (newAllBlocks.length < allBlocks.length) {
    const dropDistance = (allBlocks.length - newAllBlocks.length)*2
    
    console.log(dropDistance);
    

    const newState = {
      ...s,
      allBlocks: dropBlockDown(newAllBlocks, dropDistance),
      score: s.score + dropDistance * 100,
    };

    return newState;
  }

  return s;
};

const dropBlockDown = (blockToDrop: Array<Tetrominos>, dropDistance: number): Array<Tetrominos> => {
  const moveDistance = dropDistance/5 * Block.HEIGHT;

  return blockToDrop.map((block) => {
    const { cube1, cube2, cube3, cube4 } = block;
    if (Move.isBlockInsideScreen(block, 20, "y")) {
      return {
        cube1: Move.moveCube(cube1, moveDistance, "y"),
        cube2: Move.moveCube(cube2, moveDistance, "y"),
        cube3: Move.moveCube(cube3, moveDistance, "y"),
        cube4: Move.moveCube(cube4, moveDistance, "y"),
      };
    } else {
      return block;
    }
  });
};




