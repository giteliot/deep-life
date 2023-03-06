import {UI} from './ui/ui.js';
import {World} from './world/world.js';

const config = {
    "cellSize": 16,
    "density": 0.2
}

const canvas = document.getElementById("main-canvas");
const width = document.body.clientWidth;
const height = document.body.clientHeight;
const gridWidth = Math.floor(width/config.cellSize);
const gridHeight = Math.floor(height/config.cellSize)-1;

const world = new World(gridWidth, gridHeight, config.density);
//world.addAgents("06F200F000064", 1);
world.addAgents("060200F110054", 1);

const ui = new UI(canvas, world, config.cellSize);
ui.render();

const lifeCycle = () => {
    if (world.playStep()) {
        clearInterval(intId); 
        console.log("EVERYONE IS DEAD. SIMULATION ENDED. ")
    }

    ui.render();
}

const intId = setInterval(lifeCycle, 100);

const killAll = () => clearInterval(intId);

setTimeout(() => {clearInterval(intId); console.log("SIMULATION ENDED")}, 1*1000)