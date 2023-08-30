
import { Block, Position, State, Tetrominos, Viewport } from "./types";

export {hide, createSvgElement, createTetro}

import { main } from "./main";

// tetro spawn position
const createTetro = () => {
  return Position.SPAWN_POS;
}

  // const newTetro = {
  //   cube1: {x: 100, y: 0},
  //   cube2: {x: 100 - Block.WIDTH, y: 0}, 
  //   cube3: {x: 100, y: Block.HEIGHT},
  //   cube4: {x: 100 - Block.WIDTH, y: Block.HEIGHT}
  // };

  // checkEndGame(s, newTetro)? newTetro : newTetro;
    

// const checkEndGame = (s: State, currBlock: Tetrominos) : State => {
//   const collidesWithOtherBlocks = s.allBlocks?.some(existingBlock =>
//     Tick.isBlockCollided(currBlock, existingBlock)
//   );
  
//   const endGameState = {...s, gameEnd: true};

//   collidesWithOtherBlocks?  endGameState :  s;
// }



  
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



// const blockIsInRow = (block: Tetrominos, row: number): boolean => {
//   return (
//     block.cube1.y === row * Block.HEIGHT &&
//     block.cube2.y === row * Block.HEIGHT &&
//     block.cube3.y === row * Block.HEIGHT &&
//     block.cube4.y === row * Block.HEIGHT
//   );
// };


// const clearRow = (s: State) => {


// }
