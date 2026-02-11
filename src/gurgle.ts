import {Application, ApplicationState} from "./helpers.js";
import {clearLog, app} from "./bash.js";
import {Dictionary} from "./util/Dictionary.js";
import {GurgleGame} from "./util/GurgleGame.js";

export class gurgle extends Application {
	game: GurgleGame | undefined;
	loading;
	// noinspection HttpUrlsUsage
	static help = ["&nbsp;&nbsp;&nbsp;&nbsp;A clone of that famous word puzzle.",
	"&nbsp;&nbsp;&nbsp;&nbsp;Credits: SCOWL (<a href='http://wordlist.aspell.net/'>http://wordlist.aspell.net/</a>) ",
		"&nbsp;&nbsp;&nbsp;&nbsp;for the list of English and Canadian words.",
		"&nbsp;&nbsp;&nbsp;&nbsp;The lists for commonality 10~~80 were loaded into ",
		"&nbsp;&nbsp;&nbsp;&nbsp;(but not necessarily used in) this application."];

	constructor() {
		super();
		this.loading = true;
		Dictionary.init().then(
			function() {
				(app as gurgle).loading = false;
		},
			function(e) {
				alert(e + " :failed to load dictionary for gurgle.")
		});
	}

	redraw() {
		super.redraw();
		this.updateColour(new Date());
	}

	evaluate(command: string) {
		//super.evaluate(command);
		if (command === "q") {	//Use this to quit instead of "quit/exit", as those words may conflict with the game.
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
			s = "Press enter to start a new game, or 'q' to quit. "
		}
		else {
			s = "Guess? ('q' to quit) ";
		}
		return [s];
	}

}