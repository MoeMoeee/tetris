
import { Observable, map } from "rxjs";
import { Move, Tick } from "./state";
import { Block, Constants, Cube, BlockType, State, Tetrominos, Viewport } from "./types";

export {hide, createSvgElement, createTetro, isEndGame}

// tetro spawn position

const createTetro = (random: number) => {
  const scaleRandom = RNG.scale(RNG.hash(random));
  
  if (scaleRandom >= -1 && scaleRandom < -0.9) {
    return BlockType.I;
  } 
  else if (scaleRandom >= -0.9 && scaleRandom < -0.8) {
    return BlockType.O;
  } 
  else if (scaleRandom >= -0.8 && scaleRandom < -0.7) {
    return BlockType.T;
  } 
  else if (scaleRandom >= -0.7 && scaleRandom < -0.6) {
    return BlockType.J;
  } 
  else if (scaleRandom >= -0.6 && scaleRandom < -0.5) {
    return BlockType.L;
  } 
  else if (scaleRandom >= -0.5 && scaleRandom < -0.4) {
    return BlockType.S;
  } 
  else if (scaleRandom >= -0.4 && scaleRandom < -0.3) {
    return BlockType.Z;
  } 
  else {
    return BlockType.O; 
  }
};

  

export function createRngStreamFromSource<T>(source$: Observable<T>) {
  return function createRngStream(
    seed: number 
  ): Observable<number> {
    const randomNumberStream = source$.pipe(
      map(() => {
        seed = RNG.hash(seed); 
        return RNG.scale(seed);
      })
    );
    
    return randomNumberStream;
  };
}

// Code for creating random stream from Applied Class 
export abstract class RNG {
  // LCG using GCC's constants
  private static m = 0x80000000; // 2**31
  private static a = 1103515245;
  private static c = 12345;

  /**
   * Call `hash` repeatedly to generate the sequence of hashes.
   * @param seed
   * @returns a hash of the seed
   */
  public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

  /**
   * Takes hash value and scales it to the range [-1, 1]
   */
  public static scale = (hash: number) => (2 * hash) / (RNG.m - 1) - 1;
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







