import {shuffle} from '../utils/utils.js';
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

		this.generateStartingFood();

		console.log(`initializing WORLD with parameters`
			+`\nsize=(${this.width},${this.height})`
			+`\nfood density=${this.foodDensity}`);
	}

	getFreeCellsIndexes() {
		const fCells = [];
		for (let i = 0; i < this.state.length; i++)
			if (this.state[i] == values.EMPTY)
				fCells.push(i)
		return fCells;
	}

	addFood(index) {
		this.foods.push(index);
		this.state[index] = values.FOOD;
	}

	generateStartingFood() {
		const totalFood = this.width*this.height*this.foodDensity;
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

	removeAgent(position, kth) {

		if (this.agents[position].length > 1) {
			const k = Math.min(kth, this.agents.length-1);
			this.agents[position].splice(k, 1);
		} else {
			delete this.agents[position];
		}

		this.state[position] = this.state[position] == values.AGENT ? 0 : this.state[position]/values.AGENT;
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
		const up = position-this.width;
		const down = position+this.width;
		const ul = up >= 0 & position%this.width > 0 ? this.state[up-1] : -1;
		const u = up >= 0 ? this.state[up] : -1;
		const ur = up >= 0 & position%this.width < this.width-1  ? this.state[up+1] : -1;
		const l = position%this.width > 0 ? this.state[position-1] : -1;
		const r = position%this.width < this.width-1 ? this.state[position+1] : -1;
		const bl = down < this.height*(this.width-1) & position%this.width > 0 ? this.state[down-1] : -1;
		const b = down < this.height*(this.width-1) ? this.state[down] : -1;
		const br = down < this.height*(this.width-1) & position%this.width < this.width-1  ? this.state[down+1] : -1;
		return [ ul, u, ur,
				l, r, 
				bl, b, br];
	}

	countAliveAgents() {
		let tot = 0;
		for (let agents of Object.values(this.agents)) {
			tot += agents.length;
		}
		return tot;
	}

	playStep() {
		let tot = 0;
	   	const actions = {};
		for (let [position, agents] of Object.entries(this.agents)) {
			position = Number(position);
			let totAgents = agents.length;
			for (let k = 0; k < totAgents; k++) {
				tot++;
				const agent = agents[k];
				actions.agent = {};
				actions.agent.state = this.getAgentState(position);
				actions.agent.action = agent.getAction(actions.agent.state);
				if (!actions.agent.action)
					continue;
				const newPosition = this.getNewPosition(position, actions.agent.action);
				actions.agent.hasMoved = false;

				
				if (position != newPosition) {
					// console.log(`${position} -> ${newPosition}, ${actions.agent.action}`)
					actions.agent.hasMoved = true;
					this.removeAgent(position, k);
					k--;
					totAgents--;
					this.addAgent(agent, newPosition);
				}
				actions.agent.ate = this.state[position]%values.FOOD == 0	
			}
		}

		this.state.forEach((value, index) => {
			while (value%values[values.FOOD] == 0) {
				value = value/values[values.FOOD];
			}
			this.state[index] = value;
		});

		// add new food?
		for (let [position, agents] of Object.entries(this.agents)) {
			position = Number(position);
			const totAgents = agents.length;
			for (let k = 0; k < totAgents; k++) {

				const agent = agents[k];
				if (!actions.agent.action)
					continue;
				actions.agent.nextState = this.getAgentState(position);
				const outcomes = agent.playStep(actions.agent);
				if (outcomes.isDead) {
					this.removeAgent(position,k);
				}
				if (outcomes.doesProcreate) {
					console.log("PROCREATING "+position);
					// TODO add DNA evolution logic
					this.addAgent(new Agent(agent.dna.dna), position);
				}
			}
		}

		const stillAlive = this.countAliveAgents();
		// console.log(`step ended - ${stillAlive} agents remaining`);
		return stillAlive < 1
	}
}