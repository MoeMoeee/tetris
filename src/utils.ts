
import { Block, Constants, Cube, Position, State, Tetrominos, Viewport } from "./types";

export {hide, createSvgElement, createTetro, isEndGame, clearRow}


// tetro spawn position
const createTetro = () => {
  return Position.SPAWN_POS;
}

  
/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");
  
/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

const blockMatchedCurrent = (blockA: Tetrominos, blockB: Tetrominos): boolean => {
  const isCollision = (cubeA: Cube) => (cubeB: Cube) =>
    cubeA.x === cubeB.x && cubeA.y === cubeB.y;

  return Object.values(blockA).some(cubeA =>
    Object.values(blockB).some(isCollision(cubeA))
  );
};

const isEndGame = (s: State): State => {
  const currState = s;
  const endGameState = {...s, gameEnd: true};

  const collidesWithOtherBlocks = s.allBlocks?.some(existingBlock =>
    blockMatchedCurrent(s.currentBlock, existingBlock)
  );

  return (collidesWithOtherBlocks) ? endGameState : currState;
};

// To know which row we need to remove, we need to check how many cubes 
// are in an y-axis across all CANVAS_HEIGHT
// After clear the row, we also need to drop down the stacked blocks 
// and increment the score 
function clearRow(s: State): State {
  const { allBlocks } = s;

  if (!allBlocks) {
      return s;
  }

  // a array of size height of the screen 
  // and store value of total cubes occupied 
  const rowOccupancy = new Array(Viewport.CANVAS_HEIGHT).fill(0);

  const newRowOccupancy = rowOccupancy.map(value => value); // Create a copy of rowOccupancy

  s.allBlocks?.forEach((block) => {
      Object.values(block).forEach((cube) => {
          if (cube.y >= 0) {
              newRowOccupancy[cube.y] += 1; // Update the copied array
          }
      });
  });
  
  

  const newState = newRowOccupancy.reduce((currentState, rowCount) => {
    if (rowCount === Constants.GRID_WIDTH) {
      // filter out the blocks we about to remove
      const newAllBlocks = currentState.allBlocks?.filter((block: Tetrominos) =>
        !Object.values(block).some(
          (cube) => cube.y >= 0 && newRowOccupancy[cube.y] === Constants.GRID_WIDTH
        )
      );
        
      if (newAllBlocks) {
        return {
          ...currentState,
          allBlocks: newAllBlocks, // update new 
          score: currentState.score + (allBlocks.length - newAllBlocks.length)*100, 
          //update score when we cleared a row
        };
      }
    }
    
    return currentState;
  }, s);


  return newState;

}


