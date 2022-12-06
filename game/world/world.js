import {shuffle} from '../utils/utils.js';
import {Agent} from '../agent/agent.js';

export const values = {
	"EMPTY": 0,
	"FOOD": 1,
	"AGENT": 7  
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
		this.state[cellIndex] =  values.AGENT;
		this.agents[cellIndex] = agent;
	}

	addAgents(dna, numAgents) {
		console.log(`adding ${numAgents} agents with DNA ${dna}`)
		const agent = new Agent(dna);
		for (let k = 0; k < numAgents; k++) {
			const freeCells = this.getFreeCellsIndexes();
			const cell = Math.floor(Math.random() * freeCells.length);
			this.addAgent(agent, cell);
		}
	}
}