import {shuffle, range} from '../utils/utils.js';
import {Agent, ACTIONS} from '../agent/agent.js';

export const values = {
	"EMPTY": 0,
	"FOOD": 2,
	"AGENT": 3  
}

export class World {
	constructor(width, height, foodDensity) {
		this.width = width;
		this.height = height;
		this.foodDensity = foodDensity;
		this.agents = {};
		this.foods = [];

		this.state = Array(this.height*this.width).fill(0);
		this.stepNumber = 0;

		this.generateStartingFood();

		console.log(`initializing WORLD with parameters`
			+`\nsize=(${this.width},${this.height})`
			+`\nfood density=${this.foodDensity}`);
	}

	getFreeCellsIndexes() {
		const fCells = [];
		for (let i = 0; i < this.state.length; i++)
			if (this.state[i] == values.EMPTY || this.state[i]%values.AGENT != 0)
				fCells.push(i)
		return fCells;
	}

	addFood(index) {
		this.foods.push(index);
		this.state[index] = values.FOOD;
	}

	generateStartingFood(quantity) {
		let totalFood = quantity;
		if (!totalFood)
			totalFood = this.width*this.height*this.foodDensity;

		shuffle(this.getFreeCellsIndexes()).slice(0, totalFood).forEach(i => {
			this.addFood(i);
		});
	}

	addAgent(agent, cellIndex) {

		if (this.state[cellIndex]%values.AGENT == 0 && this.state[cellIndex] > 0) {
			this.state[cellIndex] *= values.AGENT;
			this.agents[cellIndex].push(agent);
		} else {
			this.state[cellIndex] = values.AGENT;
			this.agents[cellIndex] = [agent];
		}
	}

	removeAgent(position, id) {

		for (let [position, agents] of Object.entries(this.agents)) {
			let totAgents = this.agents[position].length;
			for (let k = 0; k < totAgents; k++) {
				if (this.agents[position][k].id == id) {
					this.agents[position].splice(k,1);
					if (this.agents[position].length == 0)
						delete this.agents[position];
					break;
				}
			}
		}

		this.state[position] = this.state[position] == values.AGENT ? 0 : Math.floor(this.state[position]/values.AGENT);
	}

	addAgents(dna, numAgents) {
		console.log(`adding ${numAgents} agents with DNA ${dna}`)
		for (let k = 0; k < numAgents; k++) {
			let agent = new Agent(dna);
			const freeCells = this.getFreeCellsIndexes();
			const cell = Math.floor(Math.random() * freeCells.length);
			this.addAgent(agent, cell);
			//this.addAgent(new Agent(agent.dna.dna), cell);
		}
	}

	getNewPosition(oldPosition, action) {
		let newPosition = oldPosition;
		switch(action) {
			case ACTIONS.UP: 
				newPosition = oldPosition > this.width? oldPosition-this.width: oldPosition;
				break;
			case ACTIONS.LEFT:
				newPosition = oldPosition%this.width > 0? oldPosition-1 : oldPosition;
				break;
			case ACTIONS.DOWN:
				newPosition = oldPosition < this.height*(this.width-1)? oldPosition+this.width : oldPosition;
				break;
			case ACTIONS.RIGHT:
				newPosition = oldPosition%this.width < this.width-1? oldPosition+1 : oldPosition;
				break;
			default:
				break;

		}
		return newPosition;
	}

	getAgentState(position) {
		const centerRow = Math.floor(position/this.width);

		const valueState = (i, row) => {
			if (i < row*this.width || i > (row+1)*this.width-1) {
				return -1;
			}
			return this.state[i];
		}

		const values = range(-2,2).map((k) => {
			const row = centerRow+k;
			if (row < 0 || row > this.height)
				return Array(5).fill(-1);
			return range(position+this.width*k-2, position+this.width*k+2)
				.map((i) => valueState(i, row));
		}).flat();

		values.splice(12, 1)
				
		return values;
	}

	countAliveAgents() {
		let tot = 0;
		for (let agents of Object.values(this.agents)) {
			tot += agents.length;
		}
		return tot;
	}

	playStep() {
		if (this.stepNumber % 20 == 0)
			console.log(`num tensors = ${tf.memory().numTensors}`);
		this.stepNumber++;
		// console.log("step "+this.stepNumber)
	   	const actions = {};
		for (let [position, agents] of Object.entries(this.agents)) {
			position = Number(position);
			let totAgents = agents.length;

			for (let k = 0; k < totAgents; k++) {
				const agent = agents[k];
				const key = agent.id;
				
				actions[key] = {};
				actions[key].agent = agent;
				const step = {};
				actions[key].step = step;

				step.state = this.getAgentState(position);
				step.action = agent.getAction(step.state);

				if (step.action == undefined) {
					continue;
				}
				const newPosition = this.getNewPosition(position, step.action);
				step.hasMoved = position != newPosition;

				step.position = position;
				step.newPosition = newPosition;
			}
		}

		// console.log(actions);

		// add new food?
		for (let k of Object.keys(actions)) {
			let step = actions[k].step;
			let agent = actions[k].agent;
			// console.log(agent.incubating);

			step.ate = this.state[step.newPosition] > 0 && this.state[step.newPosition]%values.FOOD == 0;

			if (step.action != undefined) {
				step.nextState = this.getAgentState(step.newPosition);
			}
			
			const outcomes = agent.playStep(step);

			if (!outcomes)
				continue;

			actions[k].isDead = outcomes.isDead;
			
			if (outcomes.doesProcreate) {
				console.log(`${agent.id} PROCREATING`);
				// TODO add DNA evolution logic
				// child.brain = agent.brain;

				for (let k = 0; k < agent.offspring; k++) {
					let child = new Agent(agent.generateChildDNA())
					this.addAgent(child, step.newPosition);
				}
			}
		}

		for (let k of Object.keys(actions)) {
			let position = actions[k].step.position;
			let newPosition = actions[k].step.newPosition;
			let isDead = actions[k].isDead;
			let agent = actions[k].agent;

			if (newPosition && position != newPosition) {
				// console.log(`${position} -> ${newPosition}, ${actions.agent.action}`)
				this.removeAgent(position, k);
				this.addAgent(agent, newPosition);
			}

			if (isDead) {
				agent.brain.dispose();
				this.removeAgent(position,k);
				this.addFood(position);
				this.addFood(newPosition);
			}
		}

		this.state.forEach((value, index) => {
			while (value%values[values.FOOD] == 0) {
				value = value/values[values.FOOD];
			}
			this.state[index] = value;
		});

		const stillAlive = this.countAliveAgents();
		// console.log(`step ended - ${stillAlive} agents remaining`);
		return stillAlive < 1;
	}
}