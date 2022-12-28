import {values} from '../world/world.js';
import {scalarToCoord} from '../utils/utils.js';

const COLOR = {
	[values.EMPTY]: "black",
	[values.FOOD]: "#8aecff",
	[values.AGENT]: "#d3d3d3"
}

export class UI {
	constructor(canvas, world, cellSize) {
		this.canvas = canvas;
		this.world = world;
		this.cellSize = cellSize;
		this.canvas.width = world.width*this.cellSize;
		this.canvas.height = world.height*this.cellSize;
	}

	renderBackground() {
		const ctx = this.canvas.getContext("2d");
		ctx.fillStyle = COLOR[values.EMPTY];
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	render() {
		this.renderBackground();
		const ctx = this.canvas.getContext("2d");
		this.world.state.forEach((value, index) => {
			if (value == values.EMPTY)
				return;

			ctx.fillStyle = value%values.AGENT == 0? this.world.agents[index][0].color: COLOR[values.FOOD];
			let coord = scalarToCoord(index, this.world.width, this.world.height);
			//console.log(`coloring ${coord[0]}, ${coord[1]}, ${COLOR[value]}`);
			ctx.fillRect(coord[0]*this.cellSize, coord[1]*this.cellSize, this.cellSize, this.cellSize);

			if (value%values.AGENT == 0) {
				ctx.lineWidth = 1;
				ctx.strokeStyle = COLOR[value];
				ctx.strokeRect(coord[0]*this.cellSize, coord[1]*this.cellSize, this.cellSize, this.cellSize);
			}
		});
	}
}