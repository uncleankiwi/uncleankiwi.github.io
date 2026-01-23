import {Application} from "./helpers.js";
import {printLine} from "./bash.js";

export class hoge extends Application {
    evaluate(command) {
        super.evaluate(command);
        printLine("hoge...")
    }

    prompt() {
        return "hoge prefix: ";
    }
}