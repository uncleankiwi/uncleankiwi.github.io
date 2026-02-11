
import {Application, ApplicationState} from "./helpers.js";
import {cmd} from "./cmd.js";
import {gurgle} from "./gurgle.js";
import {mm} from "./mm.js";
import {suso} from "./suso.js";
import {Colour} from "./util/Colour.js";
import {clock} from "./clock.js";
import {hoge} from "./hoge.js";
import {KeyState} from "./util/KeyState.js";


//A collection of lines of text. Each line contains a LogNode, which may contain more LogNodes.
//Adding a line marks it as dirty, which will cause it to be redrawn on the page next refresh.
//Nodes that require animation are also placed in a Set, and every animation frame those are
//fetched, stepped through, and if any were animated the Log is marked dirty.
class Log {
	MAX_LINES = 20;
	dirty: boolean;
	nodesToAnimate: Set<LogNode>;
	nodesArray: LogNode[];
	currentInput: string;

	constructor() {
		this.dirty = false;
		this.nodesToAnimate = new Set<LogNode>();
		this.nodesArray = [];
		this.currentInput = "";
	}

	printLine(...str: (string | LogNode)[]) {
		//Scooting nodes over until there is 1 space for the new line.
		while (this.nodesArray.length + 1 >= this.MAX_LINES) {
			this.nodesToAnimate.delete(this.nodesArray.shift()!);
		}
		let nodeToAdd: LogNode;
		if (str.length === 1) {
			if (typeof(str[0]) === "string") {
				nodeToAdd = new LogNode(str[0]);
			}
			else {
				nodeToAdd = str[0];
			}
		}
		else {
			let arrLogNodes: LogNode[] = str.map(x => {
				if (typeof(x) === "string") {
					return new LogNode(x);
				}
				else {
					return x;
				}
			});
			nodeToAdd = new LogNode(arrLogNodes);
		}
		if (nodeToAdd.toAnimate) {
			this.nodesToAnimate.add(nodeToAdd);
		}
	}

	clear() {
		if (this.nodesArray.length != 0) {
			this.dirty = true;
		}
		this.nodesArray.length = 0;
		this.nodesToAnimate.clear();
	}

	//User pressed enter - move app.prompt() and currentInput into log array.
	enter() {
		printLine([Log.getAppPrompt(), this.currentInput]);
	}

	//Prints stuff to the page only if changes have been made i.e. if dirty
	drawLog() {
		if (!this.dirty) {
			return;
		}

		let output = "";
		for (let i = 0; i < rowsFilled; i++) {
			output += "<p>" + this.nodesArray[i].toString() + "</p>";
		}
		output += "<p>" + Log.getAppPrompt() + output + "</p>";
		(document.getElementById('cmd') as HTMLElement).innerHTML = output;

		this.dirty = false;
	}

	static getAppPrompt() {
		let s = app.prompt();
		if (typeof(s) === "string") {
			return s;
		}
		else {
			return s.toString();
		}
	}
}

export class LogNode {
	toAnimate: boolean;
	str: string | undefined;
	children: LogNode[] | undefined;

	constructor(toDisplay?: string | LogNode[] | undefined, toAnimate: boolean = false) {
		if (typeof(toDisplay) === "undefined") {
			this.str = "";
		}
		else if (typeof(toDisplay) === "string") {
			this.str = toDisplay;
		}
		else {
			this.children = toDisplay;
			for (let i = 0; i < this.children.length; i++) {
				let node = this.children[i];
				if (node.toAnimate) {
					this.toAnimate = true;
					break;
				}
			}
		}
		this.toAnimate = toAnimate;
	}

	toString() {
		if (this.str !== undefined) {
			return this.str;
		}
		else {
			let output = "";
			for (let i = 0; i < this.children!.length; i++) {
				output += this.children![i].toString();
			}
			return output;
		}
	}
}

/*
Main script. Handles the log and displaying/highlighting of the log.
Stores which 'application' is currently running, and fetches the input prefix from them.
 */
let log: Log = new Log();
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
		log.currentInput += e.key;
	}
	else if (e.key === 'Backspace') {
		log.currentInput = log.currentInput.substring(0, log.currentInput.length - 1);
		e.preventDefault();	//prevent browser back from happening
	}
	else if (e.key === 'Enter') {
		printLine(decorateInput());
		app.evaluate(log.currentInput);
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
		log.currentInput = "";
	}
}

function decorateInput() {
	return app.prompt() + currentInput;
}

export function clearLog() {
	log.clear();
}

//Decorates the input line plus prefix (username and all), then appends log with it.
export function printLine(...str: (string | LogNode)[]) {
	log.printLine(...str);
}

function swapApplication(startedApp: string) {
	app = eval(`new ${startedApp}();`);
}

//Prints out every line of log.
export function drawLog() {
	log.drawLog();
}

//For updating shift/control/alt status in keyState variable.
//keyof typeof KeyState
function updateKeyState(keyString: keyof KeyState, isDown: boolean) {
	keyState[keyString] = isDown;
}

