import {DNA} from './dna.js';
import {createDeepQNetwork} from './brain.js';
import {randomInt} from '../utils/utils.js';

export const ACTIONS = {
	'STILL': 0, 
	'UP': 1,
	'DOWN': 2, 
	'LEFT': 3, 
	'RIGHT': 4
}

const NUM_ACTIONS = 5;
const VISION = 8;
const ENERGY = {
	"INCUBATING": 0.1,
	"STATIC": 0.1,
	"MOVE": 0.9
}
const ENERGY_WHILE_INCUBATION = 0.1;
const ENERGY_CONSUMPTION = 1;

export class Agent {
	constructor(dnaStr) {
		// console.log(`agent born with dna ${dnaStr}`)
		this.dna = new DNA(dnaStr);
		this.color = this.dna.color;
		this.maxEnergy = this.dna.maxEnergy;
		this.energy = this.maxEnergy/2;
		this.maxTTA = this.dna.inverseSpeed;
		this.ticksToAction = this.maxTTA;
		this.brain = createDeepQNetwork(VISION, this.dna.neurons, NUM_ACTIONS)
		this.incubating = 20; //should be part of DNA?
		this.epsilon = 0.5;
	}

	getStateTensor(state) {
		return tf.tensor(state);
	}

	getAction(state) {
		if (this.incubating >= 0)
			console.log(this.ticksToAction)
		this.ticksToAction--;
		if (this.incubating > 0) {
			this.incubating--;
		}
		if (this.incubating <= 0 & this.ticksToAction > 0)
			return; 

		let action;
		if (Math.random() < this.epsilon) {
	      action = randomInt(0,NUM_ACTIONS);
	    } else {
	      tf.tidy(() => {
	        const stateTensor = this.getStateTensor(state).expandDims();
	        action = this.brain.predict(stateTensor).argMax(-1).dataSync()[0];
	      });
	    }
		return action;
	}

	playStep(step) {
		const isIncubation = this.incubating > 0;
		const isActionable = this.ticksToAction == 0;

		if (isIncubation && this.incubating <= 0) {
			console.log("STOPPED INCUBATING")
			this.energy = this.maxEnergy/2;
		}

		if (isActionable) {
			this.ticksToAction = this.maxTTA;
		}

		let reward = 0;
		if (isActionable | isIncubation)
			reward++;

		if (step.ate) {
			this.energy += 10;
			reward += 10;
		}

		if (!step.hasMoved) {
			if (!isIncubation && isActionable)
				this.energy -= ENERGY.STATIC;
		} else {
			this.energy -= isIncubation ? ENERGY.INCUBATING : ENERGY.MOVE;
		}

		const outcomes = {
			"isDead": false,
			"doesProcreate": false
		};
		if (this.energy < 0) {
			console.log("agent dead for lack of energy");
			outcomes.isDead = true;
		}
		
		if (this.energy >= this.maxEnergy && !isIncubation) {
			outcomes.doesProcreate = true;
			this.energy = this.maxEnergy/2;
		}
		// console.log(`energy ${this.energy}/${this.maxEnergy}`);
		return outcomes;
		// train brain if necessary
	}
}


