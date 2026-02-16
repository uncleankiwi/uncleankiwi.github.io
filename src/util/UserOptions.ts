//Stores the VALID options and their respective parameters that the user has entered.
//Invalid options (i.e. those that aren't in the appOptions in the current application aren't stored.)

//Stores one AppOption and the corresponding user state
import {AppOption} from "./AppOption.js";
import {Application} from "../helpers.js";

class UserOption {
	appOption: AppOption;
	isOn: boolean;
	para: string | undefined;


	constructor(ao: AppOption) {
		this.appOption = ao;
		this.isOn = false;
	}
}

export class UserOptions {
	optionsMap: Map<string, UserOption>;

	constructor(application: Application) {
		this.optionsMap = new Map<string, UserOption>();
		let appOptions: AppOption[] = eval(application.constructor.name + ".appOptions");
		appOptions.forEach(x => {
			this.optionsMap.set(x.option, new UserOption(x));
		});
	}
}