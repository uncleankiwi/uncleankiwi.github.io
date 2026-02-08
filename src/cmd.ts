/*
Default application loaded by bash.
Contains a directory of applications that can be loaded.
 */
import {
	Application,
	ApplicationState,
	makeRainbow,
	wrapColour,
	wrapIndividualCharsWithRandomPastelColours
} from "./helpers.js";
import {clearLog, printLine} from "./bash.js";
import {gurgle} from "./gurgle.js";
import {mm} from "./mm.js";
import {suso} from "./suso.js";
import {clock} from "./clock.js";
import {hoge} from "./hoge.js";

export class cmd extends Application {
	static name = "cmd";
	static HELP = "help";
	static RAINBOW = "rainbow";
	static CLEAR = "clear";

	//Only the keys (the application names) will be used for now.
	//The values could hold application options/a short description in the future?
	directory = new Map([
		["gurgle", ''],
		["mm", ''],
		["suso", ''],
		["clock", ''],
		["hoge", '']
	]);
	user= 'user@uncleankiwi.github.io';
	path = '~';
	nextApplication = '';

	constructor() {
		super();
	}

	//Run the function stored in the map if the key matches.
	evaluate(command) {
		let commandArgs = command.split(" ");
		super.evaluate(commandArgs[0]);
		if (this.state === ApplicationState.CLOSE) {
		return;
		}
		if (this.directory.has(commandArgs[0])) {
			this.nextApplication = commandArgs[0];
			this.state = ApplicationState.OPEN_APPLICATION;
		}
		else if (commandArgs[0] === cmd.HELP) {
			//Checking for application-specific help.
			if (commandArgs.length > 1) {
				if (this.directory.has(commandArgs[1])) {
					let helpTextArr = eval(commandArgs[1] + ".help");
					for (let i = 0; i < helpTextArr.length; i++) {
						printLine(helpTextArr[i]);
					}
				}
				else {
					printLine("No such application: " + commandArgs[1]);
				}
			}
			//Printing generic help.
			else {
				printLine("<span style='text-decoration-line: underline;'>Fake JS bash</span>");
				printLine(`Type \`${cmd.HELP}\` to see this list.`);
				printLine(`Available commands in cmd: \`${cmd.RAINBOW}\` and \`${cmd.CLEAR}\`.`)
				printLine(`Available commands in every application: \`${Application.EXIT}\` and \`${Application.QUIT}\`.`);
				printLine("Executable scripts (may not be implemented):");
				printLine("");
				let keys = this.directory.keys();
				keys.forEach(key => printLine(key));
			}
		}
		else if (commandArgs[0] === cmd.RAINBOW) {
			printLine(makeRainbow(wrapIndividualCharsWithRandomPastelColours("Rainbow text rainbow text rainbow text.")));
		}
		else if (commandArgs[0] === cmd.CLEAR) {
			clearLog();
		}
		else {
			// noinspection GrazieInspection
			if (commandArgs[0] === "ls" || commandArgs[0] === "cd") {
				//To implement "cd .." if this is implemented as well.
				printLine("No filesystem analogue yet.")
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
		this.updateColour(new Date());
	}

	prompt() {
		return wrapColour(this.user, '#55cc33')  + ':' + wrapColour(this.path, '#5566ee') + '$ ';
	}
}