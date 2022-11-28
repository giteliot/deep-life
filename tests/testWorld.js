import {World} from '../game/world/world.js';
import { equal } from "assert";

describe('World Creation', () => {
  const world = new World(10, 10, 0.5);
  it('it should have the correct number of cells', () => {
    equal(world.state.length, 100);
  });
  it('it should create proper number of food', () => {
  	let count = 0;
  	world.state.forEach((x) => {count+=x;})
    equal(count, 50);
  });
});
