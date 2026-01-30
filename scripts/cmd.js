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
import {printLine} from "./bash.js";
import {gurgle} from "./gurgle.js";

export class cmd extends Application {

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
		super.evaluate(command);
			if (this.state === ApplicationState.CLOSE) {
			return;
		}
		if (this.directory.has(command)) {
			this.nextApplication = command;
			this.state = ApplicationState.OPEN_APPLICATION;
		}
		else if (command === "help") {
			printLine("Fake JS bash");
			printLine("Type `help` to see this list.");
			printLine("The following are some scripts that can be run");
			printLine("(may not be implemented though).")
			printLine("`rainbow`, `exit`, and `quit` are some additional commands.");
			printLine("");
			let keys = this.directory.keys();
			keys.forEach(key => printLine(key));
		}
		else if (command === "rainbow") {
			printLine(makeRainbow(wrapIndividualCharsWithRandomPastelColours("Rainbow text rainbow text rainbow text.")));
		}
		else if (command === "ls" || command === "cd" || command === "cd ..") {
			printLine("No filesystem analogue yet.")
		}
		else if (command.trim() === "") {
			//do nothing.
		}
		else {
			printLine(command + ': command not found');
		}
	}

	redraw() {
		super.redraw();
		this.animColour(new Date());
	}

	prompt() {
		return wrapColour(this.user, '#55cc33')  + ':' + wrapColour(this.path, '#5566ee') + '$ ';
	}
}