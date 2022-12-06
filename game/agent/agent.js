import {DNA} from './dna.js';
import {createDeepQNetwork} from './brain.js';

const NUM_ACTIONS = 4;

export class Agent {
	constructor(dnaStr) {
		this.dna = new DNA(dnaStr);
		this.color = this.dna.color;
		this.energy = this.dna.maxEnergy/2;
		this.ticksToAction = this.dna.inverseSpeed;
		this.brain = createDeepQNetwork(this.dna.vision.reduce((x,y) => x+y), this.dna.neurons, NUM_ACTIONS)
	}
}