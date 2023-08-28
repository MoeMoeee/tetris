import { Block, State, Viewport } from "./types";

export {hide, show, createSvgElement, createTetro, generateNewBlock}



// create initial place for the tetro
const createTetro = () => {
    return {
      cube1: {x: 0, y: 0},
      cube2: {x: Block.WIDTH, y: 0}, 
      cube3: {x: 0, y: Block.HEIGHT},
      cube4: {x: Block.WIDTH, y: Block.HEIGHT}
    };
}


/** Rendering (side effects) */

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);
  };
  
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


  const generateNewBlock = (s: State) => {
    return {
      cube1: {x: 0, y: 0},
      cube2: {x: Block.WIDTH, y: 0}, 
      cube3: {x: 0, y: Block.HEIGHT},
      cube4: {x: Block.WIDTH, y: Block.HEIGHT}
    };
  }