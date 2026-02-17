import { Application, ApplicationState, spaces } from "./helpers.js";
import { clearLog, app } from "./bash.js";
import { Dictionary } from "./util/Dictionary.js";
import { GurgleGame } from "./util/GurgleGame.js";
import { AppOption } from "./util/AppOption.js";
export class gurgle extends Application {
    constructor() {
        super();
        this.loading = true;
        Dictionary.init().then(function () {
            app.loading = false;
        }, function (e) {
            alert(e + " :failed to load dictionary for gurgle.");
        });
    }
    redraw() {
        super.redraw();
    }
    evaluate(command) {
        //super.evaluate(command);
        if (command === "q") { //Use this to quit instead of "quit/exit", as those words may conflict with the game.
            clearLog();
            this.state = ApplicationState.CLOSE;
            return;
        }
        if (this.loading) {
            return;
        }
        if (this.game === undefined || this.game.won || this.game.lost) {
            this.game = new GurgleGame(5, 0, 3, 5);
            clearLog();
            this.game.draw();
        }
        else {
            this.game.grade(command.toLowerCase());
            clearLog();
            this.game.draw();
        }
    }
    prompt() {
        let s;
        if (this.loading) {
            s = "Loading...";
        }
        else if (this.game === undefined || this.game.lost || this.game.won) {
            s = "Press enter to start a new game, or 'q' to quit. ";
        }
        else {
            s = "Guess? ('q' to quit) ";
        }
        return [s];
    }
}
gurgle.applicationName = "gurgle";
gurgle.shortHelp = "A clone of that famous word puzzle.";
// noinspection HttpUrlsUsage
gurgle.longHelp = [
    "Credits: SCOWL (<a href='http://wordlist.aspell.net/'>http://wordlist.aspell.net/</a>) ",
    "for the list of English and Canadian words.",
    "The lists for commonality 10~~80 were loaded into ",
    "(but not necessarily used in) this application."
];
gurgle.appOptions = [
    new AppOption("l", "length of word. Random when param unspecified.", "len"),
    new AppOption("a", "highest commonality of word to use as answer (0-8)", "aLimit"),
    new AppOption("g", "highest commonality of word usable as guess (0-8)", "gLimit")
];
