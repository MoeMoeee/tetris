import { Action, Block, State, Tetrominos } from "./types";

export { initialState, reduceState, Rotate, Tick, Move }


// create initial place for the tetro
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


class Move implements Action {
    constructor(public readonly moveDistance: number, public readonly axis: string) { } 

    static moveCube = (cube: { x: number; y: number }, moveDistance: number, axis: string) => (
        {
          x: axis === 'x'? cube.x + moveDistance : cube.x,
          y: axis === 'y'? cube.y + moveDistance : cube.y
        }
      )

    static moveBlock = (s: State, moveDistance: number, axis: string) => ({
        cube1: Move.moveCube(s.currentBlock.cube1, moveDistance, axis),
        cube2: Move.moveCube(s.currentBlock.cube2, moveDistance, axis),
        cube3: Move.moveCube(s.currentBlock.cube3, moveDistance, axis),
        cube4: Move.moveCube(s.currentBlock.cube4, moveDistance, axis),
    })

    // need to fix this
    apply = (s: State) => {
        const updatedBlock = {
            ...s,
            currentBlock: Move.moveBlock(s, this.moveDistance, this.axis)
          };

        return updatedBlock;
    };
};

class Rotate implements Action {

    // TODO
    apply = (s: State) => {
        const updatedState = {
        ...s,
        currentBlock: Tick.moveTetroDown(s.currentBlock),
        };

        return updatedState;
    };
};



class Tick implements Action {
    constructor(public readonly state: State) { }
    static moveTetroDown = (tetro: Tetrominos) => {
        return {
          cube1: { x: tetro.cube1.x, y: tetro.cube1.y + 1 },
          cube2: { x: tetro.cube2.x, y: tetro.cube2.y + 1 },
          cube3: { x: tetro.cube3.x, y: tetro.cube3.y + 1 },
          cube4: { x: tetro.cube4.x, y: tetro.cube4.y + 1 },
        };
      };
    
    static handleCollisions = (s: State): State => s; //TODO

    /**
     * Updates the state by proceeding with one time step.
     *
     * @param s Current state
     * @returns Updated state
     */
    apply = (s: State) => {
        const updatedState = {
        ...s,
        currentBlock: Tick.moveTetroDown(s.currentBlock),
        };

        return updatedState;
    };

}


const reduceState = (s: State, action: Action) => action.apply(s);
