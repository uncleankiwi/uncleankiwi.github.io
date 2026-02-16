import { spaces } from "../helpers.js";
export class AppOption {
    constructor(option, description, param, hidden = false) {
        this.option = option;
        this.description = description;
        this.param = param;
        this.hidden = hidden;
    }
    //Gets a short one-liner version of the options.
    // [-bc] [-a param]
    static getOptionsString(options) {
        if (options.length === 0) {
            return undefined;
        }
        let noParamOptions = "";
        let paramOptions = [];
        options.forEach(x => {
            if (x.param === undefined) {
                noParamOptions += x.option;
            }
            else {
                paramOptions.push(x);
            }
        });
        let output = [];
        if (noParamOptions.length > 0) {
            output.push(`[-${noParamOptions}]`);
        }
        paramOptions.forEach(x => {
            output.push(`[-${x.option} ${x.param}]`);
        });
        return output.join(" ");
    }
    /*
    Lists them like this (starting indentation is handled by help application):
      -a param	some explanation.
      -b 		more text.
      -c		some more text.
    Between option and description should be space + longestParam worth of spaces + tab
     */
    static listOptions(options) {
        if (options.length === 0) {
            return undefined;
        }
        //Finding longest param to see how many spaces should be padded in between option and description.
        let longestParam = 0;
        options.forEach(x => {
            if (x.param !== undefined && x.param.length > longestParam) {
                longestParam = x.param.length;
            }
        });
        //Now actually building options list
        let output = [];
        options.forEach(x => {
            let paramString = x.param ?? "";
            let paramSpaces = spaces(longestParam - paramString.length);
            output.push(`-${x.option} ${paramString}${paramSpaces}\t${x.description}`);
        });
        return output;
    }
}
