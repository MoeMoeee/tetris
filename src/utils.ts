
import { Move, Tick } from "./state";
import { Block, Constants, Cube, Position, State, Tetrominos, Viewport } from "./types";

export {hide, createSvgElement, createTetro, isEndGame}

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





