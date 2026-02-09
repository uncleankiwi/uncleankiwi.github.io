
import {Application, ApplicationState} from "./helpers.js";
import {cmd} from "./cmd.js";
import {gurgle} from "./gurgle.js";
import {mm} from "./mm.js";
import {suso} from "./suso.js";
import {Colour} from "./util/Colour.js";
import {clock} from "./clock.js";
import {hoge} from "./hoge.js";
import {KeyState} from "./util/KeyState.js";

/*
Main script. Handles the log and displaying/highlighting of the log.
Stores which 'application' is currently running, and fetches the input prefix from them.
 */

const MAX_LINES = 20;	//Does not include the input line.
let log: string[] = [];
let currentInput: string = "";
let rowsFilled: number = 0;
// let cursorPos = 0;
export let app: Application = new cmd();
let keyState = new KeyState();

setInterval(refreshScreen, 100);

document.addEventListener('DOMContentLoaded', () => {
	drawLog();
});
document.addEventListener('keyup', (e) => {
	onKeyUp(e);
	drawLog();
	app.redraw();
});
document.addEventListener('keydown', (e) => {
	onKeyDown(e);
});

function refreshScreen() {
	drawLog();
	app.step(new Date());	//Does colour animations
	app.redraw();	//Refreshes the log
}

function onKeyDown(e: KeyboardEvent) {
	if (e.key === "Shift" || e.key === "Control" || e.key === "Alt") {
		updateKeyState(e.key, true);
	}
	app.onKeyDown(keyState, e);
}

function onKeyUp(e: KeyboardEvent) {
	if (e.key === "Shift" || e.key === "Control" || e.key === "Alt") {
		updateKeyState(e.key, false);
	}

	if (e.key.length === 1) {
		currentInput += e.key;
	}
	else if (e.key === 'Backspace') {
		currentInput = currentInput.substring(0, currentInput.length - 1);
		e.preventDefault();	//prevent browser back from happening
	}
	else if (e.key === 'Enter') {
		printLine(decorateInput());
		app.evaluate(currentInput);
		if (app.state === ApplicationState.CLOSE) {
			if (app.constructor.name === cmd.applicationName) {
				clearLog();
				printLine("Cmd restarted.");
			}
			app = new cmd();
		}
		else if (app.state === ApplicationState.OPEN_APPLICATION) {
			//Only allow cmd to swap applications.
			if (app.constructor.name === cmd.applicationName) {
				swapApplication((app as cmd).nextApplication);
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
export function printLine(str: string) {
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

function swapApplication(startedApp: string) {
	app = eval(`new ${startedApp}();`);
}

//Prints out every line of log.
export function drawLog() {
	let output = "";
	for (let i = 0; i < rowsFilled; i++) {
		output += log[i] + '<br />';
	}
	output += decorateInput();
	(document.getElementById('cmd') as HTMLElement).innerHTML = output;
}

//For updating shift/control/alt status in keyState variable.
//keyof typeof KeyState
function updateKeyState(keyString: keyof KeyState, isDown: boolean) {
	keyState[keyString] = isDown;
}
