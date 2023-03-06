import {World} from '../game/world/world.js';
import { equal, deepEqual } from "assert";
import {ACTIONS} from '../game/agent/agent.js';

describe('World Creation', () => {
  const world = new World(10, 10, 0.3);
  it('it should have the correct number of cells', () => {
    equal(world.state.length, 100);
  });
  it('it should create proper number of food', () => {
  	let count = 0;
  	world.state.forEach((x) => {count+=x;})
    equal(count, 60);
  });
});

describe('getNewPosition', () => {
  const world = new World(3, 4, 0.1);
  it('stay still', () => {
    equal(world.getNewPosition(2,ACTIONS.STILL), 2);
  });
  it('goes UP', () => {
    equal(world.getNewPosition(5,ACTIONS.UP), 2);
  });
  it('goes LEFT', () => {
    equal(world.getNewPosition(2,ACTIONS.LEFT), 1);
  });
  it('goes DOWN', () => {
    equal(world.getNewPosition(2,ACTIONS.DOWN), 5);
  });
  it('goes RIGHT', () => {
    equal(world.getNewPosition(1,ACTIONS.RIGHT), 2);
  });
  it('blocked UP', () => {
    equal(world.getNewPosition(0,ACTIONS.UP), 0);
  });
  it('blocked LEFT', () => {
    equal(world.getNewPosition(0,ACTIONS.LEFT), 0);
  });
  it('blocked LEFT SOUTH', () => {
    equal(world.getNewPosition(3,ACTIONS.LEFT), 3);
  });
  it('blocked DOWN', () => {
    equal(world.getNewPosition(11,ACTIONS.DOWN), 11);
  });
  it('blocked RIGHT', () => {
    equal(world.getNewPosition(2,ACTIONS.RIGHT), 2);
  });
});


describe('getAgentState', () => {
  const world = new World(5, 5, 0);
  it('center -> all 0s', () => {
    deepEqual(world.getAgentState(12), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('up left -> half 0s', () => {
    deepEqual(world.getAgentState(0), [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, -1, -1, 0, 0, 0, -1, -1, 0, 0, 0]);
  });
});



