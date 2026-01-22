import {Colour} from "./util/Colour.js";

export function wrapColour(str, colour) {
	return '<span style="color: ' + colour + '">' + str + '</span>';
}

export const ApplicationState = Object.freeze({
	CLOSE: 0,
	OPEN: 1,
	OPEN_APPLICATION: 2
})

export function step(colourString, stepSize) {
	let colour = new Colour(colourString);
	return colour.increment(stepSize);
}

export function changeColor() {
	let k = document.getElementById("cmd").style.color;
	let tag = "<span style='color: #bbbb00;'></span>";

}

export class Application {
	state = ApplicationState.OPEN;

	evaluate(command) {
		if (command === 'exit' || command === 'quit') {
			this.state = ApplicationState.CLOSE;
		}
	}

	prompt() {

	}
}