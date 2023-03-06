import {DNA} from './dna.js';
import {createDeepQNetwork} from './brain.js';
import {randomInt} from '../utils/utils.js';
import {ReplayMemory} from './memory.js';

export const ACTIONS = {
	'STILL': 0, 
	'UP': 1,
	'DOWN': 2, 
	'LEFT': 3, 
	'RIGHT': 4
}

const NUM_ACTIONS = 5;
const VISION = 24;
const ENERGY = {
	"INCUBATING": 0.1,
	"STATIC": 0.2,
	"MOVE": 2
}
const ENERGY_WHILE_INCUBATION = 0.1;
const ENERGY_CONSUMPTION = 1;

export class Agent {
	constructor(dnaStr) {
		// console.log(`agent born with dna ${dnaStr}`)
		this.id = Math.floor(Math.random() * 100000000);
		this.dna = new DNA(dnaStr);
		this.color = this.dna.color;
		this.maxEnergy = this.dna.maxEnergy;
		this.energy = this.maxEnergy/2;
		this.maxTTA = this.dna.inverseSpeed;
		this.ticksToAction = this.maxTTA;
		this.brain = createDeepQNetwork(VISION, this.dna.neurons, NUM_ACTIONS)
		this.incubating = 20; //should be part of DNA?
		this.memory = new ReplayMemory(this.incubating);
		this.offspring = 3;

		this.frames = 0;
		this.maxFrames = this.incubating*10;
		this.maxEpsilon = 1;
		this.minEpsilon = 0.1;
		this.optimizer = tf.train.adam(1/this.dna.learningSpeed);
		this.gamma = 0.99;
		this.batchSize = this.incubating/2;

		this.avgReward = new MovingAverage(100);
	}

	generateChildDNA() {
		const parentDna = this.dna.dna;
		let childDNA = "";

	  	for (let i = 0; i < parentDna.length; i++) {

	    	if (Math.random() < 0.1) {
		      var decimalValue = parseInt(parentDna[i], 16);
		      if (Math.random() < 0.5) {
		        decimalValue = (decimalValue + 1) % 16;
		      } else {
		        decimalValue = (decimalValue + 15) % 16;
		      }
		      var hexValue = decimalValue.toString(16);
		      childDNA += hexValue;
		    } else {
		      childDNA += parentDna[i];
		    }
		  }
		  return childDNA;
	}


	getStateTensor(state) {
		return tf.tensor(state);
	}

	getAction(state) {

		if (this.incubating <= 0 && this.ticksToAction > 0) {
			return;
		}

		let action;


		const epsilon = (this.minEpsilon-this.maxEpsilon)*Math.min(this.frames, this.maxFrames)/this.maxFrames + this.maxEpsilon;

		if (Math.random() < epsilon) {
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
		
		// should do an action
		const isIncubation = this.incubating > 0;
		const isActionable = step.action;

		if (!isIncubation && step.action != undefined) {
			// console.log(`${this.id} - ${this.energy}`);
			// console.log(step);
		}

		if (this.incubating == 0) {
			this.incubating--
			this.energy = this.maxEnergy/2;
		}

		// update waiting
		if (this.incubating > 0) {

			this.incubating--;
		} else {
			this.ticksToAction--;
			if (this.ticksToAction < 0) {
				this.ticksToAction = this.maxTTA;
			}
		}
		
		if (step.action == undefined) {
			return
		}


		// actually compute action
		this.frames++;

		let reward = -1;

		if (step.ate) {
			this.energy += 40;
			reward += 20;
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
			console.log(`${this.id} dead for lack of energy`);
			outcomes.isDead = true;
		}
		
		if (this.energy >= this.maxEnergy && !isIncubation) {
			outcomes.doesProcreate = true;
			this.reward += 90;
			this.energy = this.maxEnergy/2;
		}
		// console.log(`energy ${this.energy}/${this.maxEnergy}`);
		step.reward = reward;

		// train
		this.memory.append(step);

		if (!isIncubation) {
			this.train();
		}

		this.avgReward.append(step.reward);
		if (this.frames%100 == 0) {
			console.log(`${this.id} - avgReward = ${this.avgReward.average()}`);
		}

		return outcomes;
	}

	train() {
	    const batch = this.memory.sample(this.batchSize);

	    const lossFunction = () => tf.tidy(() => {
	    	const stateTensor = this.getStateTensor(
	    	    batch.map(example => example.state)
	    	    );

	    	const actionTensor = tf.tensor1d(
	    	    batch.map(example => example.action), 'int32');

	    	const qs = this.brain.apply(stateTensor, {training: true})
	    	    .mul(tf.oneHot(actionTensor, NUM_ACTIONS)).sum(-1);

	    	const rewardTensor = tf.tensor1d(batch.map(example => example.reward));

	    	const nextStateTensor = this.getStateTensor(
	    	    batch.map(example => example.nextState)
	    	    );

	    	const nextMaxQTensor = 
	    	    this.brain.predict(nextStateTensor).max(-1);

	    	const doneMask = tf.scalar(1).sub(
	    	    tf.tensor1d(batch.map(example => example[3])).asType('float32'));
	    	const targetQs =
	    	    rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(this.gamma));

	    	const mqe = tf.losses.meanSquaredError(targetQs, qs);

	    	return mqe;

	    });

	    const grads = tf.variableGrads(lossFunction);
	    this.optimizer.applyGradients(grads.grads);
	    tf.dispose(grads);
	}
}

class MovingAverage {
  constructor(bufferLength) {
    this.buffer = [];
    for (let i = 0; i < bufferLength; ++i) {
      this.buffer.push(null);
    }
  }

  append(x) {
    this.buffer.shift();
    this.buffer.push(x);
  }

  average() {
    return this.buffer.reduce((x, prev) => x + prev) / this.buffer.length;
  }
}

