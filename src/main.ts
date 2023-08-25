/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { Observable, concat, fromEvent, interval, merge } from "rxjs";
import { map, filter, scan, takeWhile } from "rxjs/operators";
import {hide, show, createSvgElement} from "./utils";
import { Key, Event, Tetrominos, State, Block, Viewport, Constants } from './types'



const createTetro = () => {
  return {
    cube1: {x: 0, y: 0},
    cube2: {x: Block.WIDTH, y: 0}, 
    cube3: {x: 0, y: Block.HEIGHT},
    cube4: {x: Block.WIDTH, y: Block.HEIGHT}
  };
}

// Define the initial state using the State type
const initialState: State = {
  gameEnd: false,
  currentBlock: createTetro() 
} as const;



const moveTetroDown = (tetro: Tetrominos) => {
  return {
    cube1: { x: tetro.cube1.x, y: tetro.cube1.y + 1 },
    cube2: { x: tetro.cube2.x, y: tetro.cube2.y + 1 },
    cube3: { x: tetro.cube3.x, y: tetro.cube3.y + 1 },
    cube4: { x: tetro.cube4.x, y: tetro.cube4.y + 1 },
  };
};

const collide = () => {
  //TODO: 

}



/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  const container = document.querySelector("#main") as HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  /** User input */

  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  const fromKey = (keyCode: string, moveDistance: number, axis: string): Observable<{moveDistance: number, axis: string}> =>
    key$.pipe(
      filter(({ code }) => code === keyCode),
      map(() => ({ moveDistance, axis }))
    );


  const left$ = fromKey("KeyA", -5, "x");
  const right$ = fromKey("KeyD", 5, "x");
  const down$ = fromKey("KeyS", 5, "y");

  /** Observables */
  const moveBlock$ = merge(left$, right$, down$)
  .pipe(
    scan((acc: State, { moveDistance, axis }) => ({
      ...acc,
      currentBlock: moveBlock(acc, moveDistance, axis),
    }), initialState)
  )
  

  const moveBlock = (s: State, moveDistance: number, axis: string) => {
  
    const updatedBlock = {
      cube1: moveCube(s.currentBlock.cube1, moveDistance, axis),
      cube2: moveCube(s.currentBlock.cube2, moveDistance, axis),
      cube3: moveCube(s.currentBlock.cube3, moveDistance, axis),
      cube4: moveCube(s.currentBlock.cube4, moveDistance, axis),
    };

    return updatedBlock;
    // return isCollision(updatedBlock) ? s.currentBlock : updatedBlock;
  };
  
  const moveCube = (cube: { x: number; y: number }, moveDistance: number, axis: string) => (
    {
      x: axis === 'x'? cube.x + moveDistance : cube.x,
      y: axis === 'y'? cube.y + moveDistance : cube.y
    }
  )
  

  /** Determines the rate of time steps */
  const tick$ = interval(Constants.TICK_RATE_MS);

  /**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
  const tick = (s: State) => {
    console.log('tick');
    

    const updatedState = {
      ...s,
      currentBlock: moveTetroDown(s.currentBlock),
    };

    return updatedState;
  };

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  const render = (s: State) => {
    svg.innerHTML = "";

    // Create the top-left rectangle
    const rect1 = createSvgElement(preview.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${s.currentBlock.cube1.x}`,
      y: `${s.currentBlock.cube1.y}`,
      style: "fill: green",
    });
    svg.appendChild(rect1);
    

    // Create the top-right rectangle
    const rect2 = createSvgElement(preview.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${s.currentBlock.cube2.x}`,
      y: `${s.currentBlock.cube2.y}`,
      style: "fill: green",
    });
    svg.appendChild(rect2);
  
    // Create the bottom-left rectangle
    const rect3 = createSvgElement(preview.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${s.currentBlock.cube3.x}`,
      y: `${s.currentBlock.cube3.y}`,
      style: "fill: green",
    });
    svg.appendChild(rect3);
  
    // Create the bottom-right rectangle
    const rect4 = createSvgElement(preview.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${s.currentBlock.cube4.x}`,
      y: `${s.currentBlock.cube4.y}`,
      style: "fill: green",
    });
    svg.appendChild(rect4);

  

    // Add a block to the preview canvas
    const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${Block.WIDTH * 2}`,
      y: `${Block.HEIGHT}`,
      style: "fill: green",
    });
    preview.appendChild(cubePreview);
  };



  const source$ = merge(tick$, moveBlock$)
  .pipe(
    scan((s: State,) => tick(s), initialState)
  )
  .subscribe((s: State) => {
    render(s);
    if (s.gameEnd) {
      show(gameover);
    } else {
      hide(gameover);
    }
  });
}

// The following simply runs your main function on window load. Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}