import { Application, ApplicationState } from "./helpers.js";
import { Colour } from "./util/Colour.js";
import { KeyState } from "./util/KeyState.js";
import { cmd } from "./cmd.js";
export var AnimationType;
(function (AnimationType) {
    AnimationType[AnimationType["RAINBOW"] = 0] = "RAINBOW";
})(AnimationType || (AnimationType = {}));
const FRAME_DELAY = 100;
/*A collection of lines of text. Each line contains a LogNode, which may contain more LogNodes.
    Nodes that require animation are also placed in a Set, and every animation frame those are
    fetched and stepped through.
    */
class Log {
    constructor() {
        this.MAX_LINES = 20;
        this.nodesToAnimate = new Set();
        this.nodesArray = [];
        this.currentInput = "";
    }
    printArray(strArr) {
        //Scooting nodes over until there is 1 space for the new line.
        while (this.nodesArray.length + 1 >= this.MAX_LINES) {
            this.nodesToAnimate.delete(this.nodesArray.shift());
        }
        let nodeToAdd;
        if (strArr.length === 1) {
            if (typeof (strArr[0]) === "string") {
                nodeToAdd = new LogNode(strArr[0]);
            }
            else {
                nodeToAdd = strArr[0];
            }
        }
        else {
            let arrLogNodes = strArr.map(x => {
                if (typeof (x) === "string") {
                    return new LogNode(x);
                }
                else {
                    return x;
                }
            });
            nodeToAdd = new LogNode(arrLogNodes);
        }
        this.nodesArray.push(nodeToAdd);
        if (nodeToAdd.toAnimate) {
            this.nodesToAnimate.add(nodeToAdd);
        }
    }
    printLine(...str) {
        this.printArray(str);
    }
    clear() {
        this.nodesArray.length = 0;
        this.nodesToAnimate.clear();
    }
    //User pressed enter - move app.prompt() and currentInput into log array.
    enter() {
        printLine(Log.getAppPrompt(), this.currentInput);
    }
    drawLog() {
        let output = "";
        for (let i = 0; i < this.nodesArray.length; i++) {
            output += "<div>" + this.nodesArray[i].toString() + "</div>";
        }
        output += "<div>" + Log.getAppPrompt() + cursor.currentInputWithCursor() + "</div>";
        document.getElementById('cmd').innerHTML = output;
    }
    step() {
        this.nodesToAnimate.forEach(x => { x.anim(); });
        //The current app's prompt also has to be animated separately since they're not stored in
        //the nodesArray or nodesToAnimate.
        app.prompt().forEach(x => {
            if (x instanceof LogNode && x.toAnimate) {
                x.anim();
            }
        });
    }
    static getAppPrompt() {
        return app.prompt().join("");
    }
}
export class LogNode {
    constructor(toDisplay) {
        this.toAnimate = false;
        this.log = log;
        if (typeof (toDisplay) === "undefined") {
            this.str = "";
        }
        else if (typeof (toDisplay) === "string") {
            this.str = toDisplay;
        }
        else {
            this.children = toDisplay;
            this.children.forEach(x => {
                x.parent = this;
                if (x.toAnimate && !this.toAnimate && this.parent === undefined) {
                    this.animationType = x.animationType;
                    this.toAnimate = true;
                    log.nodesToAnimate.add(this);
                }
            });
        }
    }
    anim() {
        if (this.animationType === AnimationType.RAINBOW) {
            this.colour?.increment(0.1);
            if (this.children !== undefined) {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].anim();
                }
            }
        }
    }
    /* If str has content or there are children with content, wrap with styles if any
        If not, if this is a top-level node, return <br /> or else return ""
     */
    toString() {
        let output = "";
        if (this.str !== undefined) {
            output += this.str;
        }
        else {
            for (let i = 0; i < this.children.length; i++) {
                output += this.children[i].toString();
            }
        }
        if (output.length === 0) {
            if (this.parent === undefined) {
                return "<br />";
            }
            else {
                return "";
            }
        }
        let styles = [];
        if (this.colour !== undefined) {
            styles.push(`color:${this.colour.raw}`);
        }
        if (this.backgroundColour !== undefined) {
            styles.push(`background-color:${this.backgroundColour.raw}`);
        }
        if (styles.length > 0) {
            output = `<span style = ${styles.join(";")}>${output}</span>`;
        }
        return output;
    }
}
/*	Left/right cursor keys move cursor pos left/right, limited to 0 <= i <= l
    Cursor index is normally 0... or rather, l.
    Entering a letter: letter is inserted at i. i++
    Backspace: [i-1] removed, i--
    Delete: if i < l, remove [i]. i unchanged.
    Blinking:
        If on and delay is >=1000ms, turn off
        On interact(move/input/delete/backspace), time since last input is set to 0ms, turn on
        If off and delay is >=1000ms, turn on
    */
class Cursor {
    constructor() {
        this.i = 0;
        this.delay = 0;
        this.toggle = true;
        this.backgroundColour =
            new Colour(window.getComputedStyle(document.getElementById("cmd")).backgroundColor);
        this.textColour =
            new Colour(window.getComputedStyle(document.getElementById("cmd")).color);
    }
    tryMoveLeft() {
        if (this.i <= 0) {
            this.i = 0;
        }
        else {
            this.i--;
        }
    }
    tryMoveRight() {
        if (this.i >= log.currentInput.length) {
            this.i = log.currentInput.length;
        }
        else {
            this.i++;
        }
    }
    currentInputWithCursor() {
        let nodes = [];
        if (log.currentInput.length > 1) { //Node left of cursor, if any
            nodes.push(new LogNode(log.currentInput.substring(0, this.i)));
        }
        let cursorNode;
        if (this.i >= log.currentInput.length) { //Cursor node
            cursorNode = new LogNode(" ");
        }
        else {
            cursorNode = new LogNode(log.currentInput.substring(this.i, this.i + 1));
        }
        cursorNode.colour = this.getTextColour();
        cursorNode.backgroundColour = this.getBackgroundColour();
        nodes.push(cursorNode);
        if (this.i < log.currentInput.length - 1) { //Node right of cursor, if any
            nodes.push(new LogNode(log.currentInput.substring(this.i + 1)));
        }
        return new LogNode(nodes);
    }
    getTextColour() {
        return this.toggle ? this.backgroundColour : undefined;
    }
    getBackgroundColour() {
        return this.toggle ? this.textColour : undefined;
    }
    interact() {
        this.delay = 0;
        this.toggle = true;
    }
    step() {
        if (this.delay >= Cursor.BLINK_DELAY) {
            this.toggle = !this.toggle;
            this.delay = 0;
        }
        else {
            this.delay += FRAME_DELAY;
        }
    }
}
Cursor.BLINK_DELAY = 500;
const cursor = new Cursor();
/*
Main script. Handles the log and displaying/highlighting of the log.
Stores which 'application' is currently running, and fetches the input prefix from them.
 */
const log = new Log();
// let cursorPos = 0;
export let app = new cmd([]);
const keyState = new KeyState(); //which keys are currently down?
setInterval(refreshScreen, FRAME_DELAY);
document.addEventListener('DOMContentLoaded', () => {
    drawLog();
});
document.addEventListener('keyup', (e) => {
    onKeyUp(e);
    drawLog();
    app.redraw();
});
document.addEventListener('keydown', (e) => {
    onKeyDown(e);
});
function refreshScreen() {
    log.step();
    cursor.step();
    drawLog();
    app.redraw(); //Refreshes the log
    checkAndCloseApplication();
}
function onKeyDown(e) {
    console.log(e);
    keyState.down(e.key);
    cursor.interact();
    let eventConsumed = app.onKeyDown(keyState, e);
    if (eventConsumed) {
        return;
    }
    //Entering a letter: letter is inserted at i. i++
    if (keyState.newestKey !== undefined && keyState.newestKey.length === 1) {
        log.currentInput = log.currentInput.substring(0, cursor.i) + keyState.newestKey +
            log.currentInput.substring(cursor.i);
        cursor.i++;
    }
    /*	Entering a letter: letter is inserted at i. i++
        Backspace: [i-1] removed, i--
         */
    else if (e.key === "ArrowLeft") {
        cursor.tryMoveLeft();
    }
    else if (e.key === "ArrowRight") {
        cursor.tryMoveRight();
    }
    //Backspace: [i - 1] removed, i--
    else if (e.key === "Backspace") {
        if (cursor.i > 0) {
            log.currentInput = log.currentInput.substring(0, cursor.i - 1)
                + log.currentInput.substring(cursor.i);
            cursor.i--;
        }
        e.preventDefault(); //prevent browser back from happening
    }
    //Delete: if i < l, remove [i]. i unchanged.
    else if (e.key === "Delete") {
        if (cursor.i < log.currentInput.length) {
            log.currentInput = log.currentInput.substring(0, cursor.i)
                + log.currentInput.substring(cursor.i + 1);
        }
    }
    else if (e.key === "Enter") {
        log.enter(); //Push app.prompt() and currentInput to the log.
        app.evaluate(log.currentInput);
        if (checkAndCloseApplication()) {
            //app.state === ApplicationState.CLOSE is true here
        }
        else if (app.state === ApplicationState.OPEN_APPLICATION) {
            //Only allow cmd to swap applications.
            if (app.constructor.name === cmd.applicationName) {
                swapApplication(app.commandArgs);
            }
        }
        log.currentInput = "";
    }
}
function onKeyUp(e) {
    keyState.up(e.key);
}
function checkAndCloseApplication() {
    if (app.state === ApplicationState.CLOSE) {
        if (app.constructor.name === cmd.applicationName) {
            clearLog();
            printLine("cmd restarted");
        }
        app = new cmd([]);
        return true;
    }
    else {
        return false;
    }
}
export function clearLog() {
    log.clear();
}
export function printLine(...str) {
    log.printLine(...str);
}
export function printArray(strArr) {
    log.printArray(strArr);
}
function swapApplication(commandArgs) {
    try {
        getClassFromModule(commandArgs).then(_ => { });
    }
    catch (e) {
        alert(e);
    }
}
async function getClassFromModule(commandArgs) {
    let cls = await importClass(commandArgs[0]);
    app = new cls(commandArgs);
    // Check if it immediately closes
    if (app.state === ApplicationState.CLOSE) {
        app = new cmd([]);
    }
}
export async function importClass(moduleName) {
    let module = await import("./" + moduleName + ".js");
    return module[moduleName];
}
//Prints out every line of log.
export function drawLog() {
    log.drawLog();
}
