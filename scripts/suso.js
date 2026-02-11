import { Application } from "./helpers.js";
import { printLine } from "./bash.js";
export class suso extends Application {
    evaluate(command) {
        super.evaluate(command);
        printLine("(unimplemented) evaluate");
    }
    prompt() {
        return ["(unimplemented) prefix"];
    }
}
