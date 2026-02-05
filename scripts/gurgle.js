import {Application} from "./helpers.js";
import {printLine} from "./bash.js";
import {Dictionary} from "./util/Dictionary.js";

export class gurgle extends Application {
	static dictionary;

	constructor() {
		super();
		Dictionary.init();
	}

	evaluate(command) {
		super.evaluate(command);
		printLine("gurg: eval");

	}

	prompt() {
		return "gurgle: prompt: ";
	}

}