import { Colour } from "./util/Colour.js";
import { KeyState } from "./util/KeyState.js";
import { AnimationType, LogNode } from "./bash.js";
export function wrapColour(s, colour) {
    let node;
    if (s instanceof LogNode) {
        node = s;
    }
    else {
        let text;
        if (typeof (s) === "number") {
            text = s.toString();
        }
        else {
            text = s;
        }
        node = new LogNode(text);
    }
    if (colour !== undefined) {
        node.colour = new Colour(colour);
    }
    return node;
}
export function makeRainbow(s) {
    let node;
    if (s instanceof LogNode) {
        node = s;
    }
    else {
        node = new LogNode(s);
    }
    node.animationType = AnimationType.RAINBOW;
    node.toAnimate = true;
    if (node.children !== undefined) {
        node.children.forEach(x => {
            x.toAnimate = true;
            x.animationType = AnimationType.RAINBOW;
        });
    }
    return node;
}
export var ApplicationState;
(function (ApplicationState) {
    ApplicationState[ApplicationState["CLOSE"] = 0] = "CLOSE";
    ApplicationState[ApplicationState["OPEN"] = 1] = "OPEN";
    ApplicationState[ApplicationState["OPEN_APPLICATION"] = 2] = "OPEN_APPLICATION";
})(ApplicationState || (ApplicationState = {}));
//Generates light-shaded colour with some saturation
export function randomPastelColour() {
    let colour = new Colour(`rgb(${rand(120, 255)},${rand(120, 255)},${rand(120, 255)})`);
    if (colour.s < 0.2) {
        colour.changeSaturation(0.2);
    }
    return colour.raw;
}
//Generates an integer between x and y
export function rand(x, y) {
    return Math.floor(x + Math.random() * (y - x + 1));
}
//Returns a bunch of spaces for indentation and such
export function spaces(n) {
    return "&nbsp;".repeat(n);
}
//Attempts to pad spaces to the left of the string such that the string's centre is about 'length' characters
//from the left.
export function padToCentre(str) {
    let spacesToPad = Math.floor(20 - (stripHtml(str).length / 2));
    for (let i = 0; i < spacesToPad; i++) {
        str = "&nbsp;" + str;
    }
    return str;
}
//Removes the HTML tags from a string - otherwise padToCentre will count characters in there as well.
function stripHtml(str) {
    return (new DOMParser().parseFromString(str, 'text/html').body.textContent) || "";
}
export function wrapRandomPastelColour(str) {
    return wrapColour(str, randomPastelColour());
}
export function wrapCharsWithPastelAndRainbow(str) {
    let output = [];
    for (let i = 0; i < str.length; i++) {
        output.push(makeRainbow(wrapRandomPastelColour(str.charAt(i))));
    }
    return new LogNode(output);
}
export class Application {
    constructor() {
        this.state = ApplicationState.OPEN;
        this.userParams = [];
    }
    evaluate(command) {
        if (command === Application.EXIT || command === Application.QUIT) {
            this.state = ApplicationState.CLOSE;
        }
    }
    redraw() {
    }
    prompt() {
        return [""];
    }
    //Used for detecting key combinations like ctrl+C.
    onKeyDown(keyState, e) {
    }
}
Application.EXIT = "exit";
Application.QUIT = "quit";
Application.shortHelp = "No short description available.";
Application.longHelp = ["No additional info available for this application."];
Application.appOptions = [];
Application.appArguments = [];
