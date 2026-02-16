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
import {clearLog, printLine} from "./bash.js";
import {gurgle} from "./gurgle.js";
import {mm} from "./mm.js";
import {suso} from "./suso.js";
import {clock} from "./clock.js";
import {hoge} from "./hoge.js";

export class cmd extends Application {
	static applicationName = "cmd";
	static HELP = "help";
	static RAINBOW = "rainbow";
	static CLEAR = "clear";

	//Only the keys (the application names) will be used for now.
	//The values could hold application options/a short description in the future?
	static directory: Map<string, string> = new Map([
		["gurgle", ''],
		["mm", ''],
		["suso", ''],
		["clock", ''],
		["hoge", '']
	]);
	user= 'user@uncleankiwi.github.io';
	path = '~';
	nextApplication: string[] = [];

	constructor() {
		super();
	}

	//Run the function stored in the map if the key matches.
	evaluate(command: string) {
		let commandArgs = command.split(" ");
		super.evaluate(commandArgs[0]);
		if (this.state === ApplicationState.CLOSE) {
		return;
		}
		if (cmd.directory.has(commandArgs[0])) {
			this.nextApplication = commandArgs;
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
				printLine("No filesystem analogue yet.");
			}
			else if (commandArgs[0].trim() === "") {
				//do nothing.
			}
			else {
				printLine(commandArgs[0] + ': command not found');
			}
		}
	}

	redraw() {
		super.redraw();
	}

	prompt() {
		return [wrapColour(this.user, '#55cc33'), ':', wrapColour(this.path, '#5566ee'), '$ '];
	}
}