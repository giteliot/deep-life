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
		this.memory = new ReplayMemory(this.incubating);

		this.frames = 0;
		this.maxFrames = this.incubating*10;
		this.maxEpsilon = 1;
		this.minEpsilon = 0.1;
		this.optimizer = tf.train.adam(1/this.dna.learningSpeed);
		this.gamma = 0.99;
		this.batchSize = this.incubating/2;
	}

	getStateTensor(state) {
		return tf.tensor(state);
	}

	getAction(state) {

		if (this.incubating > 0) {
			this.incubating--;
		} else {
			this.ticksToAction--;
			if (this.ticksToAction < 0) {
				this.ticksToAction = this.maxTTA;
			}
		}

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
		
		const isIncubation = this.incubating > 0;
		const isActionable = step.action;

		if (this.incubating == 0) {
			this.incubating--
			this.energy = this.maxEnergy/2;
		}

		this.frames++;

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
		step.reward = reward;

		this.memory.append(step);

		if (!isIncubation) {
			this.train();
		}

		return outcomes;
	}

	train() {
	    const batch = this.memory.sample(this.batchSize);

	    const lossFunction = () => tf.tidy(() => {

	    	for (let example of batch) {
	    		if (example == null) {
	    			console.log(batch);
	    		    console.log(this.frames);
	    		    console.log(this.incubating);
	    		    }
	    	}
	    	const stateTensor = this.getStateTensor(
	    	    batch.map(example => example.state)
	    	    );
	    	const actionTensor = tf.tensor1d(
	    	    batch.map(example => example.action), 'int32');

	    	// here lies the problem, idk why tho
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
	    	return tf.losses.meanSquaredError(targetQs, qs);

	    });

	    const grads = tf.variableGrads(lossFunction);
	    this.optimizer.applyGradients(grads.grads);
	    tf.dispose(grads);
	}
}


