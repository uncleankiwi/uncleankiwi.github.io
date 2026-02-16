import {spaces} from "../helpers.js";

export class AppArgument {
	param: string;
	description: string;

	constructor(param: string, description: string) {
		this.param = param;
		this.description = description;
	}

	/*
	NB: the indentation before the param is handled by help application.
	  PARAM		some explanation here
	 */
	static getAppArguments(appArguments: AppArgument[]): string[] | undefined {
		if (appArguments.length === 0) {
			return undefined;
		}
		//Finding longest param to see how many spaces should be padded in between param and description.
		let longestParam = 0;
		appArguments.forEach(x => {
			if (x.param !== undefined && x.param.length > longestParam) {
				longestParam = x.param.length;
			}
		});

		//Now actually building arg list
		let output: string[] = [];
		appArguments.forEach(x => {
			let paramString = x.param ?? "";
			let paramSpaces = spaces(longestParam - paramString.length);
			output.push(`${paramString}${paramSpaces}\t${x.description}`);
		});
		return output;
	}
}