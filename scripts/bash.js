// noinspection ES6UnusedImports

import {animColour, ApplicationState} from "./helpers.js";
import {cmd} from "./cmd.js";
// noinspection ES6UnusedImports
import {gurgle} from "./gurgle.js";
import {mm} from "./mm.js";
import {suso} from "./suso.js";
import {Colour} from "./util/Colour.js";
import {clock} from "./clock.js";
import {hoge} from "./hoge.js";

/*
Main script. Handles the log and displaying/highlighting of the log.
Stores which 'application' is currently running, and fetches the input prefix from them.
 */

const MAX_LINES = 20;	//Does not include the input line.
let log = [];
let currentInput = "";
let rowsFilled = 0;
// let cursorPos = 0;
let app = new cmd();

setInterval(refreshScreen, 1000);
// setInterval(animColour, 500);
// let colour = new Colour(document.getElementById("rainbow").color);
document.addEventListener('DOMContentLoaded', () => {
	drawLog();
});
document.addEventListener('keyup', (e) => {
	onKeyUp(e);
	drawLog();
});

function refreshScreen() {
	animColour(app);
	app.redraw();
	drawLog();
}

function onKeyUp(e) {
	if (e.key.length === 1) {
		currentInput += e.key;
	}
	else if (e.key === 'Backspace') {
		currentInput = currentInput.substring(0, currentInput.length - 1);
	}
	else if (e.key === 'Enter') {
		printLine(decorateInput());
		app.evaluate(currentInput);
		if (app.state === ApplicationState.CLOSE) {
			if (app.constructor.name === 'cmd') {
				clearLog();
				printLine("Cmd restarted.");
			}
			app = new cmd();
		}
		else if (app.state === ApplicationState.OPEN_APPLICATION) {
			//Only allow cmd to swap applications.
			if (app.constructor.name === 'cmd') {
				swapApplication(app.nextApplication);
			}
		}
		currentInput = '';
	}
}

function decorateInput() {
	return app.prompt() + currentInput;
}


export function clearLog() {
	rowsFilled = 0;
}

//Decorates the input line plus prefix (username and all), then appends log with it.
export function printLine(str) {
	if (rowsFilled >= MAX_LINES) {
		for (let i = 1; i < MAX_LINES; i++) {
			log[i - 1] = log[i];
		}
		rowsFilled = MAX_LINES;
		log[rowsFilled - 1] = str;
	}
	else {
		log[rowsFilled] = str;
		rowsFilled++;
	}
}

// export const printer = (s) => {printLine(s)};

function swapApplication(startedApp) {
	// app = new gurgle();
	app = eval("new " + startedApp + "()");
}

//Prints out every line of log.
export function drawLog() {
	let output = "";
	for (let i = 0; i < rowsFilled; i++) {
		output += log[i] + '<br />';
	}
	output += decorateInput();
	document.getElementById('cmd').innerHTML = output;
}