
import { Block, Constants, Position, State, Tetrominos, Viewport } from "./types";

export {hide, createSvgElement, createTetro, isEndGame, clearRow}

import { main } from "./main";

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
  const isCollision = (cubeA: { x: number; y: number }) => (cubeB: { x: number; y: number }) =>
    cubeA.x === cubeB.x && cubeA.y === cubeB.y;

  return Object.values(blockA).some(cubeA =>
    Object.values(blockB).some(isCollision(cubeA))
  );
};

const isEndGame = (s: State): State => {
  const currentBlock = s.currentBlock;
  const spawnPos = Position.SPAWN_POS;
  const currState = s;
  const endGameState = {...s, gameEnd: true};

  const collidesWithOtherBlocks = s.allBlocks?.some(existingBlock =>
    blockMatchedCurrent(s.currentBlock, existingBlock)
  );

  return (collidesWithOtherBlocks) ? endGameState : currState;
};


function clearRow(state: State): State {
  const { allBlocks} = state;

  if (!allBlocks) {
      return state;
  }

  const rowOccupancy = new Array(Viewport.CANVAS_HEIGHT).fill(0);

  state.allBlocks?.forEach((block) => {
      Object.values(block).forEach((cube) => {
          if (cube.y >= 0) {
              rowOccupancy[cube.y] += 1;
          }
      });
  });



  const newAllBlocks = state.allBlocks?.map((block) => {
      const cubes = Object.keys(block).map((cubeKey) => block[cubeKey]);
      const cubesBelowClearedRows = cubes.filter((cube) => cube.y >= 0 && cube.y < rowOccupancy.length && rowOccupancy[cube.y] !== Constants.GRID_WIDTH);

      return cubesBelowClearedRows.reduce((newBlock, cube) => {
          return {
              ...newBlock,
              [cubeKey]: { x: cube.x, y: cube.y + rowOccupancy.slice(cube.y + 1).filter((count) => count === Constants.GRID_WIDTH).length },
          };
      }, block);
  });

  const newState = {
      ...state,
      allBlocks: newAllBlocks,
      score: state.score + newAllBlocks.length * 1000, // Update score based on number of cleared rows
  };

  return newState;
}






