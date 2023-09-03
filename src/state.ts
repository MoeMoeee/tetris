import { Action, Block, Constants, Cube, State, Tetrominos, Viewport } from "./types";
import {  Vec, createTetro, isEndGame } from "./utils";

export { initialState, reduceState, Rotate, Tick, Move, GenerateBlock, Reset}



  
// Define the initial state using the State type
const initialState: State = {
gameEnd: false,
currentBlock: createTetro(0),
score: 0,
highScore: 0,
allBlocks: null,
nextBlock: createTetro(1),
rowCleared: 0,

} as const;

// class construction based on readings!
class Move implements Action {
  constructor(public readonly moveDistance: number, public readonly axis: string) { } 

  // this function checks if we move the block, will it collide with others
  // we need to account for the move distance of the block when we move
  static iscollideWhenMove = (s: State, currBlock: Tetrominos, moveDistance: number, axis: string): boolean => {
    // this checks when we move the block down
    if (axis === 'y') {
      return Object.values(currBlock).some((currCube) =>
        s.allBlocks?.some((block) =>
          Object.values(block).some((prevCube) =>
            currCube !== null && prevCube !== null &&
            currCube.x === prevCube.x &&
            currCube.y + moveDistance + Block.HEIGHT >= prevCube.y
          )
        )
      );
    }
    // here to check when moving the block left/right
    else if (axis === 'x') {
      return Object.values(currBlock).some((currCube) =>
        s.allBlocks?.some((block) =>
          // here means that the current block cannot be moved left/right
          // if other blocks are occupied
          Object.values(block).some((prevCube) =>
            currCube !== null && prevCube !== null &&
            currCube.x + moveDistance === prevCube.x &&
            currCube.y + Block.HEIGHT >= prevCube.y &&
            currCube.y - Block.HEIGHT <= prevCube.y
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
  
    // Check the boundary of x coordinates 
    // -15 so it looks better
    const xBoundaryCheck = (
      (!cube1 || (cube1.x + moveDistance >= 0 && cube1.x + moveDistance < Viewport.CANVAS_WIDTH - 15)) &&
      (!cube2 || (cube2.x + moveDistance >= 0 && cube2.x + moveDistance < Viewport.CANVAS_WIDTH - 15)) &&
      (!cube3 || (cube3.x + moveDistance >= 0 && cube3.x + moveDistance < Viewport.CANVAS_WIDTH - 15)) &&
      (!cube4 || (cube4.x + moveDistance >= 0 && cube4.x + moveDistance < Viewport.CANVAS_WIDTH - 15))
    );
  
    // Check the boundary of y coordinates
    // -15 so it looks better
    const yBoundaryCheck = (
      (!cube1 || cube1.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
      (!cube2 || cube2.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
      (!cube3 || cube3.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15) &&
      (!cube4 || cube4.y + moveDistance <= Viewport.CANVAS_HEIGHT - 15)
    );
    
    // check the boundary of based on the axis x/y
    if (axis === 'x') {
      return xBoundaryCheck;
    } else if (axis === 'y') {
      return yBoundaryCheck;
    }
  
    return false;
  };
  
  
      
  // here is the action to move the cube left/right/down with certain distance
  static moveCube = (cube: Cube, moveDistance: number, axis: string) => {
    if (cube) {
      return {
        ...cube,
        x: axis === 'x' ? cube.x + moveDistance : cube.x,
        y: axis === 'y' ? cube.y + moveDistance : cube.y
      };
    }
    // Handle the case where cube is null or undefined
    return null; 
  };
  

  static moveBlock = (s: State, moveDistance: number, axis: string): State => {
    // when we move the block, we need to determine if the move is valid
    // valid means the block will be inside the screen and won't collide with others
    const shouldMoveBlock = () => 
      Move.isBlockInsideScreen(s.currentBlock, moveDistance + 4, axis) && 
      !this.iscollideWhenMove(s, s.currentBlock, moveDistance, axis);
    
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
        // append the new block to the all blocks array
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
    // check if the current block collides with any blocks in the screen
    // here we create another collision check since 
    // its a bit different from checking is collision when move
    const isCollision = (cubeA: Cube | null, cubeB: Cube | null) =>
      cubeA !== null && cubeB !== null && cubeA.x === cubeB.x && cubeA.y + Block.HEIGHT === cubeB.y;
  
    return Object.values(currBlock).some((cubeA) =>
      Object.values(allBlock).some((cubeB) => isCollision(cubeA, cubeB))
    );
  };
  

  static detectCollisions = (s: State): State => {
    //check the current block collision vs others
    const collidesWithOtherBlocks = s.allBlocks?.some(existingBlock =>
      Tick.isBlockCollided(s.currentBlock, existingBlock)
    );
    
    // if collides, then we generate new block from the top
    const updatedCurrentBlock = collidesWithOtherBlocks ? s.nextBlock : s.currentBlock;
    const updatedAllBlocks = collidesWithOtherBlocks
      ? (s.allBlocks || []).
      concat(s.currentBlock): s.allBlocks; //we also want to update the current block to all blocks array

    // return the updated 
    return {
      ...s,
      currentBlock: updatedCurrentBlock,
      allBlocks: updatedAllBlocks
    };
  }

  static moveTetroDown = (s: State): State => {
    // check if the block next move distance will be in the screen
    // if yes then move
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

    // if not in the screen, then we already touch the bottom
    // we added the current block to the array
    // and create a new block and continue the game
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
    // perform a rotation for different shape of blocks
    apply(s: State): State {
      const { currentBlock } = s;
  
      const checkValid = (currentBlock && currentBlock.cube1 && currentBlock.cube2 && currentBlock.cube3 && currentBlock.cube4)
      
      // check if the current block and be rotated by checking its rotation

      if (checkValid && currentBlock.cube1.shape === "I") {
        const rotatedBlock = Rotate.rotateI(currentBlock);
        if (rotatedBlock !== null) {
          return { ...s, currentBlock: rotatedBlock };
        }
      }

      if (checkValid && currentBlock.cube1.shape === "T") {
        const rotatedBlock = Rotate.rotateT(currentBlock);
        if (rotatedBlock !== null) {
          return { ...s, currentBlock: rotatedBlock };
        }
      }

      if (checkValid && currentBlock.cube1.shape === "Z") {
        const rotatedBlock = Rotate.rotateZ(currentBlock);
        if (rotatedBlock !== null) {
          return { ...s, currentBlock: rotatedBlock };
        }
      }

      if (checkValid && currentBlock.cube1.shape === "J") {
        const rotatedBlock = Rotate.rotateJ(currentBlock);
        if (rotatedBlock !== null) {
          return { ...s, currentBlock: rotatedBlock };
        }
      }
  
      return s; // Return the original state if rotation is not possible
    }

  
    // logic to rotate shape I
    static rotateI = (currentBlock: Tetrominos): Tetrominos | null => {
      // Check if currentBlock or any of its cubes are null
      if (!currentBlock || !currentBlock.cube1 || !currentBlock.cube2 || !currentBlock.cube3 || !currentBlock.cube4) {
        return null;
      }
      
      if (currentBlock.cube1.orientation === 0) {

        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 1},
          cube2: {...currentBlock.cube2, x: currentBlock.cube1.x, y: currentBlock.cube1.y + Block.HEIGHT, orientation: 1},
          cube3: {...currentBlock.cube3, x: currentBlock.cube1.x, y: currentBlock.cube1.y + 2*Block.HEIGHT, orientation: 1},
          cube4: {...currentBlock.cube4, x: currentBlock.cube1.x, y: currentBlock.cube1.y + 3*Block.HEIGHT, orientation: 1},
        };
      
        return newBlock;
      }
      else {
        const newBlock: Tetrominos = {
            cube1: {...currentBlock.cube1, orientation: 0},
            cube2: {...currentBlock.cube2, x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y, orientation: 0},
            cube3: {...currentBlock.cube3, x: currentBlock.cube1.x + 2*Block.HEIGHT, y: currentBlock.cube1.y, orientation: 0},
            cube4: {...currentBlock.cube4, x: currentBlock.cube1.x + 3*Block.HEIGHT, y: currentBlock.cube1.y, orientation: 0},
          };

        return newBlock;

      }
    };

    // logic to rotate shape T
    static rotateT = (currentBlock: Tetrominos): Tetrominos | null => {
      // Check if currentBlock or any of its cubes are null
      if (!currentBlock || !currentBlock.cube1 || !currentBlock.cube2 || !currentBlock.cube3 || !currentBlock.cube4) {
        return null;
      }
      
      if (currentBlock.cube1.orientation === 0) {

        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 1},
          cube2: {...currentBlock.cube2, orientation: 1},
          cube3: {...currentBlock.cube3, x: currentBlock.cube1.x, y: currentBlock.cube1.y  - Block.HEIGHT , orientation: 1},
          cube4: {...currentBlock.cube4, orientation: 1},
        };
      
        return newBlock;
      }

      if (currentBlock.cube1.orientation === 1) {

        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 2},
          cube2: {...currentBlock.cube2, orientation: 2},
          cube3: {...currentBlock.cube3, orientation: 2},
          cube4: {...currentBlock.cube4, x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y, orientation: 2},
        };
      
        return newBlock;
      }


      else if (currentBlock.cube1.orientation === 2){
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 3},
          cube2: {...currentBlock.cube2, x: currentBlock.cube1.x , y: currentBlock.cube1.y + Block.HEIGHT, orientation: 3},
          cube3: {...currentBlock.cube3, orientation: 3},
          cube4: {...currentBlock.cube4, orientation: 3},
        };

        return newBlock;

      }

      else {
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 0},
          cube2: {...currentBlock.cube2, x: currentBlock.cube1.x - Block.HEIGHT, y: currentBlock.cube1.y, orientation: 0},
          cube3: {...currentBlock.cube3, x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y , orientation: 0},
          cube4: {...currentBlock.cube4, y: currentBlock.cube1.y + Block.HEIGHT,  x: currentBlock.cube1.x ,orientation: 0},
        };

        return newBlock;
      }
    };

    // logic to rotate shape Z
    static rotateZ = (currentBlock: Tetrominos): Tetrominos | null => {
      // Check if currentBlock or any of its cubes are null
      if (!currentBlock || !currentBlock.cube1 || !currentBlock.cube2 || !currentBlock.cube3 || !currentBlock.cube4) {
        return null;
      }
      
      if (currentBlock.cube1.orientation === 0) {

        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 1},
          cube2: {...currentBlock.cube2, x: currentBlock.cube1.x + Block.HEIGHT, orientation: 1},
          cube3: {...currentBlock.cube3, orientation: 1},
          cube4: {...currentBlock.cube4,  x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y - Block.HEIGHT ,orientation: 1},
        };
      
        return newBlock;
      }

      else {

        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 0},
          cube2: {...currentBlock.cube2,  x: currentBlock.cube1.x - Block.HEIGHT, orientation: 0},
          cube3: {...currentBlock.cube3, orientation: 0},
          cube4: {...currentBlock.cube4, x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y + Block.WIDTH , orientation: 0},
        };
      
        return newBlock;
      }
    }

    //// logic to rotate shape J
    static rotateJ = (currentBlock: Tetrominos): Tetrominos | null => {
      // Check if currentBlock or any of its cubes are null
      if (!currentBlock || !currentBlock.cube1 || !currentBlock.cube2 || !currentBlock.cube3 || !currentBlock.cube4) {
        return null;
      }
      
      if (currentBlock.cube1.orientation === 0) {

        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 1},
          cube2: {...currentBlock.cube2, x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y - Block.HEIGHT, orientation: 1},
          cube3: {...currentBlock.cube3, x: currentBlock.cube1.x + Block.HEIGHT, orientation: 1},
          cube4: {...currentBlock.cube4,  x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y - 2*Block.HEIGHT ,orientation: 1},
        };
      
        return newBlock;
      }

      if (currentBlock.cube1.orientation === 1) {
        

        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 2},
          cube2: {...currentBlock.cube2,  x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y, orientation: 2},
          cube3: {...currentBlock.cube3, x: currentBlock.cube1.x + 2*Block.HEIGHT, y: currentBlock.cube1.y, orientation: 2},
          cube4: {...currentBlock.cube4, x: currentBlock.cube1.x , y: currentBlock.cube1.y - Block.WIDTH , orientation: 2},
        };
      
        return newBlock;
      }

      if (currentBlock.cube1.orientation === 2) {
        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 3},
          cube2: {...currentBlock.cube2,  x: currentBlock.cube1.x , y: currentBlock.cube1.y -  Block.WIDTH, orientation: 3},
          cube3: {...currentBlock.cube3, x: currentBlock.cube1.x, y: currentBlock.cube1.y -  2*Block.WIDTH, orientation: 3},
          cube4: {...currentBlock.cube4, x: currentBlock.cube1.x + Block.HEIGHT , y: currentBlock.cube1.y - 2*Block.WIDTH , orientation: 3},
        };
      
        return newBlock;
      }

      else {
        // Create a new Tetrominos object with the rotated cubes
        const newBlock: Tetrominos = {
          cube1: {...currentBlock.cube1, orientation: 0},
          cube2: {...currentBlock.cube2,  x: currentBlock.cube1.x + Block.HEIGHT, y: currentBlock.cube1.y, orientation: 0},
          cube3: {...currentBlock.cube3, x: currentBlock.cube1.x +  2*Block.HEIGHT, y: currentBlock.cube1.y , orientation: 0},
          cube4: {...currentBlock.cube4, x: currentBlock.cube1.x + 2*Block.HEIGHT , y: currentBlock.cube1.y + Block.WIDTH , orientation: 0},
        };
      
        return newBlock;
      }
    }
  }


class GenerateBlock implements Action {
  constructor(public readonly random: number) { }

  // every time we got the value from 
  // the random number generator
  // we create a new tetro and store in the next block
  apply = (s: State) => {    
    const newBlock = createTetro(this.random); 
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


// to determine what action we do
const reduceState = (s: State, action: Action) => action.apply(s);

const clearRow = (s: State): State => {
  const { allBlocks } = s;

  if (!allBlocks) {
    return s;
  }

  // Array to keep track of row occupancy
  // the logic here is we have the array size of the rows in game
  // everytime we see cube in a row, we count
  // if the row full, we clear
  // we then drop blocks above the row we just cleared

  const rowOccupancy = new Array(Viewport.CANVAS_HEIGHT).fill(0);

  // Update the array if there are blocks in the current row
  allBlocks.forEach((block) => {
    Object.values(block).forEach((cube) => {
      if (cube !== null && cube!.y >= 0) {
        rowOccupancy[cube!.y] += 1;
      }
    });
  });

  // Calculate the number of cleared rows
  const rowToRemove = rowOccupancy.filter((count) => count === Constants.GRID_WIDTH);
  const rowsCleared = rowToRemove.length;

  // we find the index of the row we are removing 
  const removedRowCoordinate = rowOccupancy.reduce((indices, occupancy, rowIndex) => {
    return occupancy === Constants.GRID_WIDTH ? [...indices, rowIndex] : indices;
  }, []);

  // Filter out rows that are not fully occupied
  const newAllBlocks = allBlocks.map((block: Tetrominos) => {
    const cubes = Object.values(block).filter((cube) =>
      cube !== null && rowOccupancy[cube!.y] !== Constants.GRID_WIDTH 
    );
 
  // Create a new Tetrominos object with updated cubes
  const newBlock: Tetrominos = {
    cube1: cubes[0] || null,
    cube2: cubes[1] || null,
    cube3: cubes[2] || null,
    cube4: cubes[3] || null,
  };

  return newBlock;
  });


  // if we need to clear row, update the allBlocks, move above block,
  // update current score and highscore
  if (rowsCleared > 0) {

    // we filter out to see the block above the row we just clear
    const blockAbove = newAllBlocks.filter((block) => {
      const blockAboveClearedRow = Object.values(block).some((cube) => {
         if (cube) return cube.y < removedRowCoordinate;
      });
      return blockAboveClearedRow;
    });
    
    // we filter out to see the block under the row we just clear
    const remainBlocks = newAllBlocks.filter((block) => {
      const blockUnderClearedRow = Object.values(block).some((cube) => {
        if (cube) return cube.y >= removedRowCoordinate;
     });
     return blockUnderClearedRow;
    });


    // in here, we only drop the block above the cleared row ]
    // and keep the block below intact
    // and update the score and row cleared
    const newState = {
      ...s,
      allBlocks: dropBlockDownWhenClear(s, blockAbove).concat(remainBlocks),
      score: s.score + rowsCleared * 1000, // Update the score based on cleared rows
      highScore: Math.max(s.highScore, s.score + rowsCleared * 1000),
      rowCleared: rowsCleared
    };

    return newState;
  }

  return s;
};

const dropBlockDownWhenClear = (s: State, blockToDrop: Array<Tetrominos>): Array<Tetrominos> => {
  const moveDistance = Block.WIDTH;

  // code to drop above blocks down
  return blockToDrop.map((block) => {
    const { cube1, cube2, cube3, cube4 } = block;
    // perform check to make sure in the screen
    if (Move.isBlockInsideScreen(block, moveDistance, "y") &&
        Move.iscollideWhenMove(s, block, moveDistance, "y")) {
      
      return {
        cube1: Move.moveCube(cube1!, moveDistance, "y"),
        cube2: Move.moveCube(cube2!, moveDistance, "y"),
        cube3: Move.moveCube(cube3!, moveDistance, "y"),
        cube4: Move.moveCube(cube4!, moveDistance, "y"),
      };
    } else {
      return block;
    }
  });
};


