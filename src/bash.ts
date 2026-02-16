
import {Application, ApplicationState} from "./helpers.js";
import {cmd} from "./cmd.js";
import {gurgle} from "./gurgle.js";
import {mm} from "./mm.js";
import {suso} from "./suso.js";
import {Colour} from "./util/Colour.js";
import {clock} from "./clock.js";
import {hoge} from "./hoge.js";
import {KeyState} from "./util/KeyState.js";


export enum AnimationType {
	RAINBOW
}

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
		this.dirty = true;
		this.nodesToAnimate = new Set<LogNode>();
		this.nodesArray = [];
		this.currentInput = "";
	}

	printArray(strArr: (string | LogNode)[]) {
		this.dirty = true;
		//Scooting nodes over until there is 1 space for the new line.
		while (this.nodesArray.length + 1 >= this.MAX_LINES) {
			this.nodesToAnimate.delete(this.nodesArray.shift()!);
		}
		let nodeToAdd: LogNode;
		if (strArr.length === 1) {
			if (typeof(strArr[0]) === "string") {
				nodeToAdd = new LogNode(strArr[0]);
			}
			else {
				nodeToAdd = strArr[0];
			}
		}
		else {
			let arrLogNodes: LogNode[] = strArr.map(x => {
				if (typeof(x) === "string") {
					return new LogNode(x);
				}
				else {
					return x;
				}
			});
			nodeToAdd = new LogNode(arrLogNodes);
		}
		this.nodesArray.push(nodeToAdd);
		if (nodeToAdd.toAnimate) {
			this.nodesToAnimate.add(nodeToAdd);
		}
	}

	printLine(...str: (string | LogNode)[]) {
		this.printArray(str);
	}

	clear() {
		if (this.nodesArray.length !== 0) {
			this.dirty = true;
		}
		this.nodesArray.length = 0;
		this.nodesToAnimate.clear();
	}

	//User pressed enter - move app.prompt() and currentInput into log array.
	enter() {
		printLine(Log.getAppPrompt(), this.currentInput);
	}

	//Prints stuff to the page only if changes have been made i.e. if dirty
	drawLog() {
		// if (!this.dirty) {
		// 	return;
		// }

		let output = "";
		for (let i = 0; i < this.nodesArray.length; i++) {
			output += "<div>" + this.nodesArray[i].toString() + "</div>";
		}
		output += "<div>" + Log.getAppPrompt() + this.currentInput + "</div>";
		(document.getElementById('cmd') as HTMLElement).innerHTML = output;

		this.dirty = false;
	}

	step() {
		this.nodesToAnimate.forEach(x => {x.anim()});
		//The current app's prompt also has to be animated separately since they're not stored in
		//the nodesArray or nodesToAnimate.
		app.prompt().forEach(x => {
			if (x instanceof LogNode && x.toAnimate) {
				x.anim();
			}
		});
	}

	static getAppPrompt() {
		return app.prompt().join("");
	}
}

export class LogNode {
	toAnimate: boolean;
	str: string | undefined;
	children: LogNode[] | undefined;
	log: Log;	//So that the app.prompt() can be marked dirty and propagate that change to the entire log.
	colour: Colour | undefined;
	parent: LogNode | undefined;
	animationType: AnimationType | undefined;

	constructor(toDisplay?: string | LogNode[] | undefined) {
		this.toAnimate = false;
		this.log = log;
		if (typeof(toDisplay) === "undefined") {
			this.str = "";
		}
		else if (typeof(toDisplay) === "string") {
			this.str = toDisplay;
		}
		else {
			this.children = toDisplay;
			this.children.forEach(x => {
				x.parent = this;
				if (x.toAnimate && !this.toAnimate && this.parent === undefined) {
					this.animationType = x.animationType;
					this.toAnimate = true;
					log.nodesToAnimate.add(this);
				}
			});
		}
	}

	anim() {
		if (this.animationType === AnimationType.RAINBOW) {
			this.colour?.increment(0.1);
			if (this.children !== undefined) {
				for (let i = 0; i < this.children.length; i++) {
					this.children[i].anim();
				}
			}
		}
	}

	setDirty() {
		log.dirty = true;
	}

	toString() {
		let output = "";
		if (this.colour !== undefined) {
			output += `<span style = color:${this.colour.raw}>`;
		}
		if (this.str !== undefined) {
			output += this.str;
		}
		else {
			for (let i = 0; i < this.children!.length; i++) {
				output += this.children![i].toString();
			}
		}
		if (this.colour !== undefined) {
			output += "</span>";
		}
		if (output.length === 0) {
			output = "<br />";
		}
		return output;
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
	log.step();
	drawLog();
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
		log.enter();	//Push app.prompt() and currentInput to the log.
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

export function clearLog() {
	log.clear();
}

export function printLine(...str: (string | LogNode)[]) {
	log.printLine(...str);
}

export function printArray(strArr: (string | LogNode)[]) {
	log.printArray(strArr);
}

function swapApplication(startedApp: string[]) {
	app = eval(`new ${startedApp[0]}(startedApp);`);
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

