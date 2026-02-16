//Stores the VALID options and their respective parameters that the user has entered.
//Invalid options (i.e. those that aren't in the appOptions in the current application aren't stored.)

//Stores one AppOption and the corresponding user state
import {AppOption} from "./AppOption.js";
import {Application} from "../helpers.js";
import {help} from "../help.js";
import {gurgle} from "../gurgle.js";
import {mm} from "../mm.js";
import {suso} from "../suso.js";
import {clock} from "../clock.js";
import {hoge} from "../hoge.js";

class UserOption {
	appOption: AppOption;
	isOn: boolean;
	param: string | undefined;


	constructor(ao: AppOption) {
		this.appOption = ao;
		this.isOn = false;
	}
}

export class UserOptions {
	optionsMap: Map<string, UserOption>;
	application: Application;

	constructor(application: Application, ...args: string[]) {
		//Loading optionsMap
		this.application = application;
		this.optionsMap = new Map<string, UserOption>();
		let appOptions: AppOption[] = eval(application.constructor.name + ".appOptions");
		appOptions.forEach(x => {
			this.optionsMap.set(x.option, new UserOption(x));
		});

		//Loading user options and params
		this.parseUserInput(...args);
	}

	parseUserInput(...args: string[]) {
		let openParam: string | undefined;	//An option that does not yet have a parameter assigned to it
		for (let i = 1; i < args.length; i++) {
			let word = args[i];
			if (word.startsWith("-") && word.length > 1) {
				//This word is an option
				openParam = word.substring(1);
				this.set(openParam);
			}
			else {
				//This word is a param that may or may not belong to an option
				if (openParam !== undefined) {
					this.setParam(openParam, word);
					openParam = undefined;
				}
				else {
					this.application.userParams.push(word);
				}
			}
		}
	}

	set(option: string) {
		//No error thrown if the param doesn't exist
		if (this.optionsMap.has(option)) {
			this.optionsMap.get(option)!.isOn = true;
		}
	}

	setParam(option: string, param: string | undefined) {
		//No error thrown if the param doesn't exist
		if (this.optionsMap.has(option)) {
			this.optionsMap.get(option)!.param = param;
		}
	}

	get(option: string) {
		this.checkHasOption(option);
		return this.optionsMap.get(option)!.isOn;
	}

	getParam(option: string) {
		this.checkHasOption(option);
		return this.optionsMap.get(option)!.param;
	}

	checkHasOption(option: string) {
		if (!this.optionsMap.has(option)) {
			let e = "Application does not have option " + option;
			alert(e);
			throw Error(e);
		}
	}
}