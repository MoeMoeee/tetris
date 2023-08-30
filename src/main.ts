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
import {hide, createSvgElement} from "./utils";
import { Key, Event, Tetrominos, State, Block, Viewport, Constants, Action } from './types'
import { initialState, reduceState, Rotate, Tick, Move } from './state';


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

  const fromKey = (keyCode: string) =>
    key$.pipe(
      filter(({ code }) => code === keyCode),
    );




  /** Observables */
  const left$ = fromKey("KeyA");
  const right$ = fromKey("KeyD");
  const down$ = fromKey("KeyS");
  
  const moveLeft$ = left$.pipe(map(_ => new Move(-Block.WIDTH , "x")));
  const moveRight$ = right$.pipe(map(_ => new Move(Block.WIDTH, "x")));
  const moveDown$ = down$.pipe(map(_ => new Move(5, "y")));
    
  


  /** Determines the rate of time steps */
  const tick$ = interval(Constants.TICK_RATE_MS);
  
/** Rendering (side effects) */
/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
  const show = (elem: SVGGraphicsElement) => {
  elem.setAttribute("visibility", "visible");

  if (!elem.parentNode) {
    svg.appendChild(elem);
  }
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

    Object.values(s.currentBlock).forEach(cube => {
      const rect = createSvgElement(preview.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${cube.x}`,
        y: `${cube.y}`,
        style: "fill: green",
      });
      svg.appendChild(rect);
    });

    if (s.allBlocks !== null) {
      s.allBlocks.forEach(block => {
        Object.values(block).forEach(cube => {
          const rect = createSvgElement(preview.namespaceURI, "rect", {
            height: `${Block.HEIGHT}`,
            width: `${Block.WIDTH}`,
            x: `${cube.x}`,
            y: `${cube.y}`,
            style: "fill: green",
          });
          svg.appendChild(rect);
        });
      });
    }

    
    // Render score
    scoreText.textContent = `${s.score}`;
    highScoreText.textContent = `${s.score}`;


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

  const gameClock$ = tick$.pipe(scan(() => new Tick(), initialState));
  const action$ : Observable<Action> = merge(gameClock$, moveRight$, moveLeft$, moveDown$);
  const state$: Observable<State> = action$.pipe(scan(reduceState, initialState));  
  const subscription = 
  state$.subscribe((s: State) => {
    if (s.gameEnd) {
      subscription.unsubscribe();
      show(gameover);

    } else {
      render(s);

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
