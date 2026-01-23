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

//Animate the "rainbow" span itself, and also any of its children. Grandchildren and onwards aren't animated.
export function animColour() {
	let elements = document.getElementsByClassName("rainbow");
	for (let i = 0; i < elements.length; i++) {
		animateNode(elements[i]);
		let children = elements[i].children;
		for (let j = 0; j < children.length; j++) {
			animateNode(children[j]);
		}
	}
}

function animateNode(element) {
	if (element.style.color === "") {
		element.style.color = window.getComputedStyle(element).getPropertyValue("color");
	}
	let colour = new Colour(element.style.color);
	element.style.color = colour.increment(1);
}

export function randomColour() {
	return `rgb(${Math.random() * 256},${Math.random() * 256},${Math.random() * 256})`;
}

export function randomPastelColour() {
	return `rgb(${rand(200, 255)},${rand(128, 255)},${rand(128, 255)})`;
}

//Generates a number between x and y
export function rand(x, y) {
	return x + Math.random() * (y - x + 1);
}

export function wrapRandomPastelColour(str) {
	return wrapColour(str, randomPastelColour());
}

export function wrapIndividualCharsWithRandomPastelColours(str) {
	let output = "";
	for (let i = 0; i < str.length; i++) {
		output += wrapRandomPastelColour(str.charAt(i));
	}
	return output;
}

export class Application {
	state = ApplicationState.OPEN;

	evaluate(command) {
		if (command === 'exit' || command === 'quit') {
			this.state = ApplicationState.CLOSE;
		}
	}

	redraw() {

	}

	prompt() {

	}
}