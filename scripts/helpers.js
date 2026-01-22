import {Colour} from "./util/Colour.js";

export function wrapColour(str, colour) {
	return '<span style="color: ' + colour + '">' + str + '</span>';
}

export function makeRainbow(str) {
	return '<span class="rainbow">' + str + '</span>';
}

export const ApplicationState = Object.freeze({
	CLOSE: 0,
	OPEN: 1,
	OPEN_APPLICATION: 2
})

export function animColour() {
	let element = document.getElementsByClassName("rainbow");

	// console.log(element[0].color + " nullcheck");
	// console.log(window.getComputedStyle(element[0]).getPropertyValue("color"));	//todo rm

	for (let i = 0; i < element.length; i++) {
		if (element[i].style.color === "") {
			element[i].style.color = window.getComputedStyle(element[i]).getPropertyValue("color");
		}
		let colour = new Colour(element[i].style.color);
		element[i].style.color = colour.increment(1);
	}

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