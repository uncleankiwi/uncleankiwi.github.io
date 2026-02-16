import {Application, ApplicationState, wrapCharsWithPastelAndRainbow} from "./helpers.js";
import {clearLog, LogNode, printLine} from "./bash.js";
import {AppOption} from "./util/AppOption.js";
import {cmd} from "./cmd.js";
import {gurgle} from "./gurgle.js";
import {mm} from "./mm.js";
import {suso} from "./suso.js";
import {clock} from "./clock.js";
import {hoge} from "./hoge.js";

/*
When displaying help <applicationName>, it should be formatted as below (note indentation).
Options are not hardcoded into the application, instead they are written into options
together with the parameter name, and whether it is hidden (should not appear on help, default false).
They appear here only if the application has options.
===
user:~$ help applicationName
applicationName: optionsString
shortHelp

longHelp

Options:
  -a param	some explanation.
  -b 		more text.
  -c		some more text.
 */
export class help extends Application {
	static applicationName = "help";
	static optionsString: string = Application.applicationName;
	static shortHelp: string = "Displays info about bash commands and applications.";
	static longHelp = help.getLongHelp();
	static options: AppOption[] = [];

	constructor() {
		super();
		if (this.userParams.length > 0) {
			let appToFetch = this.userParams[0];
			if (cmd.directory.has(appToFetch)) {
				// noinspection JSUnresolvedReference
				let helpTextArr = eval(appToFetch + ".help");
				for (let i = 0; i < helpTextArr.length; i++) {
					printLine(helpTextArr[i]);
				}
			}
			else {
				printLine("No such application: " + appToFetch);
			}
		}
		else {
			help.printAboutBash();
		}
		this.state = ApplicationState.CLOSE;
	}

	evaluate(command: string) {
		if (command === Application.EXIT || command === Application.QUIT) {
			this.state = ApplicationState.CLOSE;
		}
	}

	redraw() {

	}

	prompt(): (string | LogNode)[] {
		return [""];
	}

	static getLongHelp() {
		let output: string[] = [];
		output[0] = "Displays info about bash commands and applications.";
		output[1] = `${cmd.HELP} without parameters gives info about bash.`;
		output[2] = `\`${cmd.HELP} PARAM\` gives info about the command or application PARAM.`;
		return output;
	}

	static printAboutBash() {
		printLine("<span style='text-decoration-line: underline;'>Fake JS bash</span>");
		printLine(`Type \`${cmd.HELP}\` to see this list.`);
		printLine(`Available commands in cmd: \`${cmd.RAINBOW}\` and \`${cmd.CLEAR}\`.`)
		printLine(`Available commands in every application: \`${Application.EXIT}\` and \`${Application.QUIT}\`.`);
		printLine("Executable scripts (may not be implemented):");
		printLine("");
		let keys = cmd.directory.keys();
		for (const key of keys) {
			printLine(key + " " + AppOption.getOptionsString(eval(key + ".appOptions")));
		}
	}
}