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
export function animColour(application) {
	let elements = document.getElementsByClassName("rainbow");
	for (let i = 0; i < elements.length; i++) {
		animateNode(elements[i], application);
		let children = elements[i].children;
		for (let j = 0; j < children.length; j++) {
			animateNode(children[j], application);
		}
	}
}

//We need the application since colour is stored per-application.
function animateNode(element, application) {
	let cssColour = element.style.color;
	if (cssColour === "") {
		cssColour = window.getComputedStyle(element).getPropertyValue("color");
	}

	let newCssColour;
	if (application.colourMap.has(cssColour)) {
		//todo
		newCssColour = lour.increment(1);
	}
	let colour = new Colour(element.style.color);
	element.style.color = colour.increment(1);

	// if (element.style.cssText === "") {
	// 	element.style.color = window.getComputedStyle(element).getPropertyValue("color");
	// 	element.
	// }
	// let colour = new Colour(element.style.color);
	// element.setAttribute("style", "color: " + colour.increment(1));
	// console.log("hello");


	// if (element.style.color === "") {
	// 	element.style.color = window.getComputedStyle(element).getPropertyValue("color");
	// 	console.log(element.sheet.cssRules);
	// }


	// if (element.style.color !== "rgb(255,0,0)") {
	// 	element.style.color = "rgb(255,0,0)";
	// 	console.log("red");
	// 	// console.log("")
	// }
	// else {
	// 	console.log(new Date().getSeconds() + "blue");
	// 	element.style.color = "rgb(0,0,255)";
	// }
}

export function randomColour() {
	return `rgb(${Math.random() * 256},${Math.random() * 256},${Math.random() * 256})`;
}

export function randomPastelColour() {
	return `rgb(${rand(200, 255)},${rand(128, 255)},${rand(128, 255)})`;
}

//Generates an integer between x and y
export function rand(x, y) {
	return Math.floor(x + Math.random() * (y - x + 1));
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
	//Stores colours and whatever they're supposed to be transformed into.
	//Could theoretically get expensive if there are many nodes, each with a different colour.
	//But it shouldn't come to that, since this is stored per-application.
	colourMap = new Map();

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