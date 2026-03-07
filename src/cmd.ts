/*
Default application loaded by bash.
Contains a directory of applications that can be loaded.
 */
import {
	Application,
	ApplicationState,
	wrapColour,
	wrapCharsWithPastelAndRainbow
} from "./helpers.js";
import {clearLog, getCurrentInput, printLine, setCurrentInput} from "./bash.js";
import "./help.js";
import {KeyState} from "./util/KeyState.js";

/*	A linked list that stores the previous commands. Serializes to and from an array.
	head: first element added
	tail: last element added 	*/
class LinkedCmdList<T> {
	head: LinkedCmdListNode<T> | undefined;
	tail: LinkedCmdListNode<T> | undefined;
	private currentSize: number = 0;
	maxSize: number;
	private cursor: LinkedCmdListNode<T> | undefined;	//which node is currently being looked at

	constructor(maxSize: number, arr?: T[]) {
		this.maxSize = maxSize;
		if (this.maxSize < 0) {
			this.maxSize = 0;
		}
		if (arr !== undefined) {
			arr.forEach(x => this.add(x));
		}
	}

	get size() {
		return this.currentSize;
	}

	add(value: T) {
		//if maxsize is 0
		if (this.maxSize === 0) {
			return;
		}

		let newNode = new LinkedCmdListNode(value);
		if (this.tail !== undefined) {
			this.tail.link(newNode);
		}
		if (this.head === undefined) {
			this.head = newNode;
		}
		this.tail = newNode;
		this.currentSize++;

		if (this.currentSize > this.maxSize) {	//There should always be at least 2 nodes at this point
			let newHead = this.head.next!;
			this.head.unlink(newHead);
			this.head = newHead;
			this.currentSize--;
		}
	}

	/*	Behaviour: if cursor is undefined, fetches tail.
	If cursor is defined (i.e. a node is selected)...
		if there is a previous node, return that
		if there isn't, return the current node.	 */
	getPrevious() : T | undefined {
		if (this.cursor === undefined) {
			if (this.tail !== undefined) {
				this.cursor = this.tail;
			}
		}
		else {
			if (this.cursor.previous !== undefined) {
				this.cursor = this.cursor.previous;
			}
		}
		return this.cursor?.value;
	}

	/*	Behaviour: if cursor is undefined, do nothing.
	If cursor is defined (i.e. a node is selected)...
		if there is a next node, return that
		if there isn't, set cursor to it anyway and return *undefined*
		Note the differences with previous().	 */
	getNext(): T | undefined {
		if (this.cursor !== undefined) {
			this.cursor = this.cursor.next;
		}
		return this.cursor?.value;
	}

	//Returns only the filled values; unfilled capacity is ignored.
	toJSON() {
		let output: T[] = Array(this.currentSize);
		let currentNode = this.head;
		for (let i = 0; i < this.currentSize; i++) {
			output[i] = currentNode!.value;
			currentNode = currentNode!.next;
		}
		return JSON.stringify(output);
	}

}

class LinkedCmdListNode<T> {
	previous: LinkedCmdListNode<T> | undefined;
	next: LinkedCmdListNode<T> | undefined;
	value: T;
	constructor(value: T) {
		this.value = value;
	}

	//Links an existing node with a new one.
	link(nextNode: LinkedCmdListNode<T>) {
		this.next = nextNode;
		nextNode.previous = this;
	}

	//Unlinks this node with the next.
	unlink(nextNode: LinkedCmdListNode<T>) {
		this.next = undefined;
		nextNode.previous = undefined;
	}
}

/*	Notes about input history storage:
		- Up/down arrows for input history scroll - 20 previous commands
			Scrolling all the way down should fetch the latest user input before it got replaced by history
		- Entering a command adds it to the tail (even those from history)
			Also stores entire history
		- Opening cmd fetches entire history
		- NB: `exit` is stored
		- NB: spamming enter doesn't store; invalid commands do store
		- NB: editing a command fetched from history won't edit that stored command, unlike the real thing */
export class cmd extends Application {
	static applicationName = "cmd";
	static HELP = "help";
	static RAINBOW = "rainbow";
	static CLEAR = "clear";
	commandHistory : LinkedCmdList<string>;
	lastEnteredCommand: string | undefined;
	static COMMANDS_TO_REMEMBER = 20;

	//Only the keys (the application names) will be used for now.
	//The values could hold application options/a short description in the future?
	static directory: Map<string, string> = new Map([
		["gurgle", ''],
		["mm", ''],
		["suso", ''],
		["clock", ''],
		["hoge", ''],
		["help", '']
	]);
	user= 'user@uncleankiwi.github.io';
	path = '~';
	commandArgs: string[] = [];

	constructor(args: string[]) {
		super(args);
		let storedCommands = localStorage.getItem(this.applicationName);
		if (!storedCommands) {
			this.commandHistory = new LinkedCmdList<string>(cmd.COMMANDS_TO_REMEMBER);
		}
		else {
			this.commandHistory = new LinkedCmdList<string>(cmd.COMMANDS_TO_REMEMBER,
				JSON.parse(storedCommands));
		}
	}

	//Run the function stored in the map if the key matches.
	evaluate(command: string) {
		let commandArgs = command.split(" ");
		let saveCommand = true;		//should this command be added to history?
		super.evaluate(commandArgs[0]);
		if (this.state === ApplicationState.CLOSE) {
			this.saveCommand(command);
			return;
		}
		if (cmd.directory.has(commandArgs[0])) {
			this.commandArgs = commandArgs;
			this.state = ApplicationState.OPEN_APPLICATION;
		}
		else if (commandArgs[0] === cmd.RAINBOW) {
			printLine((wrapCharsWithPastelAndRainbow("Rainbow text rainbow text rainbow text.")));
		}
		else if (commandArgs[0] === cmd.CLEAR) {
			clearLog();
		}
		else {
			// noinspection GrazieInspection
			if (commandArgs[0] === "ls" || commandArgs[0] === "cd") {
				//To implement "cd .." if this is implemented as well.
				printLine("No filesystem analogue yet");
			}
			else if (commandArgs[0].trim() === "") {
				saveCommand = false;
				//do nothing.
			}
			else {
				printLine(commandArgs[0] + ': command not found');
			}
		}

		if (saveCommand) {
			this.saveCommand(command);
		}
	}

	redraw() {
		super.redraw();
	}

	prompt() {
		return [wrapColour(this.user, '#55cc33'), ':', wrapColour(this.path, '#5566ee'), '$ '];
	}

	onKeyDown(keyState: KeyState, e: KeyboardEvent) {
		if (e.key === "ArrowUp") {
			let prev = this.commandHistory.getPrevious();
			if (prev !== undefined) {
				if (this.lastEnteredCommand === undefined) {
					this.lastEnteredCommand = getCurrentInput();
				}
				setCurrentInput(prev);
			}
			return true;
		}
		else if (e.key === "ArrowDown") {
			//lastEnteredCommand already displaying
			if (this.lastEnteredCommand === undefined) {
				return true;
			}

			//going to a more recent command, or to lastEnteredCommand
			let next = this.commandHistory.getNext();
			if (next !== undefined) {
				setCurrentInput(next);
			}
			else {
				setCurrentInput(this.lastEnteredCommand!);
				this.lastEnteredCommand = undefined;
			}
			return true;
		}
		return false;
	}

	saveCommand(command: string) {
		this.commandHistory.add(command);
		localStorage.setItem(this.applicationName, this.commandHistory.toJSON());
	}
}