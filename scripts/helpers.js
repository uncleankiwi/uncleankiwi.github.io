import { Colour } from "./util/Colour.js";
import { KeyState } from "./util/KeyState.js";
import { AnimationType, LogNode } from "./bash.js";
//To prevent generating fresh colours and creating bloat in each application's colour map,
//at most 100 pastel colours will be generated, then old ones will be reused.
const MAX_PASTEL_COLOURS = 100;
let pastelColourArr = [];
let pastelColourIndex = 0;
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
//Generates a limited number of pastel colours before it starts using old ones.
export function randomPastelColour() {
    if (pastelColourArr[pastelColourIndex] === undefined) {
        pastelColourArr[pastelColourIndex] =
            `rgb(${rand(120, 255)},${rand(120, 255)},${rand(120, 255)})`;
    }
    let colour = pastelColourArr[pastelColourIndex];
    pastelColourIndex++;
    if (pastelColourIndex >= MAX_PASTEL_COLOURS) {
        pastelColourIndex = 0;
    }
    return colour;
}
//Generates an integer between x and y
export function rand(x, y) {
    return Math.floor(x + Math.random() * (y - x + 1));
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
class ColourTime {
    constructor(time, colour) {
        this.time = time;
        this.colour = colour;
    }
}
export class Application {
    constructor() {
        //Stores colours and whatever they're supposed to be transformed into.
        //Could theoretically get expensive if there are many nodes, each with a different colour.
        //But it shouldn't come to that, since this is stored per-application.
        this.colourMap = new Map();
        this.state = ApplicationState.OPEN;
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
    step(lastUpdated) {
        this.stepColour(lastUpdated);
    }
    //Animate the "rainbow" span itself, and also any of its children. Grandchildren and onwards aren't animated.
    updateColour(lastUpdated) {
        let elements = document.getElementsByClassName("rainbow");
        for (let i = 0; i < elements.length; i++) {
            this.updateNodeColour(elements[i], lastUpdated);
            let children = elements[i].children;
            for (let j = 0; j < children.length; j++) {
                this.updateNodeColour(children[j], lastUpdated);
            }
        }
    }
    //We need the application since colour is stored per-application.
    //Colour has to be stored because it gets overwritten every time the log refreshes -
    //by storing the original colour, we can fetch whatever colour it is currently mutated to in the current frame.
    //Current time is also a parameter of the method and stored in the map - if multiple nodes have the same colour,
    //they should all have the same animation, i.e. the colour should not increment separately for each of them.
    //If colour is not in map, put it in.
    //If colour is in map and time is current, set colour to the map's value.
    //Colour incrementation has been moved to stepColour() so colour can be refreshed whenever keyUp happens.
    updateNodeColour(element, lastUpdated) {
        let cssColour = element.style.color;
        if (cssColour === "") {
            cssColour = window.getComputedStyle(element).getPropertyValue("color");
        }
        if (this.colourMap.has(cssColour)) {
            let value = this.colourMap.get(cssColour);
            if (value === undefined) {
                let e = "Undefined colour fetched from colourMap in updateNodeColour()";
                alert(e);
                throw Error(e);
            }
            if (value.time !== lastUpdated) {
                value.time = lastUpdated;
            }
            element.style.color = value.colour.raw;
        }
        else {
            this.colourMap.set(cssColour, new ColourTime(lastUpdated, new Colour(cssColour)));
        }
    }
    //Increment colour map and possibly other stuff.
    stepColour(lastUpdated) {
        this.colourMap.forEach((value) => {
            if (value.time !== lastUpdated) {
                value.colour.increment(10);
            }
        });
    }
}
Application.EXIT = "exit";
Application.QUIT = "quit";
Application.help = ["No additional info available for this application."];
