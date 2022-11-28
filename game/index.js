import {UI} from './ui/ui.js';
import {World} from './world/world.js';

const config = {
    "cellSize": 16,
    "density": 1e-2
}

const canvas = document.getElementById("main-canvas");
const width = document.body.clientWidth;
const height = document.body.clientHeight
const gridWidth = Math.floor(width/config.cellSize);
const gridHeight = Math.floor(height/config.cellSize)-1;

const world = new World(gridWidth, gridHeight, config.density);
const ui = new UI(canvas, world, config.cellSize);
ui.render();

