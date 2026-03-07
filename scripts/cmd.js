/*
Default application loaded by bash.
Contains a directory of applications that can be loaded.
 */
import { Application, ApplicationState, wrapColour, wrapCharsWithPastelAndRainbow } from "./helpers.js";
import { clearLog, printLine } from "./bash.js";
import "./help.js";
/*	A linked list that stores the previous commands. Serializes to and from an array.
    head: first element added
    tail: last element added 	*/
class LinkedCmdList {
    constructor(maxSize, arr) {
        this.currentSize = 0;
        this.maxSize = maxSize;
        if (this.maxSize < 0) {
            this.maxSize = 0;
        }
        if (arr !== undefined) {
            arr.forEach(x => this.add(x));
        }
    }
    get size() {
        return this.currentSize;
    }
    add(value) {
        //if maxsize is 0
        if (this.maxSize === 0) {
            return;
        }
        let newNode = new LinkedCmdListNode(value);
        if (this.tail !== undefined) {
            this.tail.link(newNode);
        }
        if (this.head === undefined) {
            this.head = newNode;
        }
        this.tail = newNode;
        this.currentSize++;
        if (this.currentSize > this.maxSize) { //There should always be at least 2 nodes at this point
            let newHead = this.head.next;
            this.head.unlink(newHead);
            this.head = newHead;
            this.currentSize--;
        }
    }
    //Returns only the filled values; unfilled capacity is ignored.
    toJSON() {
        let output = Array(this.currentSize);
        let currentNode = this.head;
        for (let i = 0; i < this.currentSize; i++) {
            output[i] = currentNode.value;
            currentNode = currentNode.next;
        }
        return JSON.stringify(output);
    }
}
class LinkedCmdListNode {
    constructor(value) {
        this.value = value;
    }
    //Links an existing node with a new one.
    link(nextNode) {
        this.next = nextNode;
        nextNode.previous = this;
    }
    //Unlinks this node with the next.
    unlink(nextNode) {
        this.next = undefined;
        nextNode.previous = undefined;
    }
}
/*	Notes about input history storage:
        - Up/down arrows for input history scroll - 20 previous commands
        - Entering a command adds it to the tail (even those from history)
            Also stores entire history
        - Opening cmd fetches entire history
        - NB: `exit` is stored
        - NB: spamming enter doesn't store; invalid commands do store	*/
export class cmd extends Application {
    constructor(args) {
        super(args);
        this.user = 'user@uncleankiwi.github.io';
        this.path = '~';
        this.commandArgs = [];
        let storedCommands = localStorage.getItem(this.applicationName);
        if (!storedCommands) {
            console.log("no history stored"); //todo rm
            this.commandHistory = new LinkedCmdList(cmd.COMMANDS_TO_REMEMBER);
        }
        else {
            console.log(storedCommands); //todo rm
            this.commandHistory = new LinkedCmdList(cmd.COMMANDS_TO_REMEMBER, JSON.parse(storedCommands));
        }
    }
    //Run the function stored in the map if the key matches.
    evaluate(command) {
        let commandArgs = command.split(" ");
        let saveCommand = true; //should this command be added to history?
        super.evaluate(commandArgs[0]);
        if (this.state === ApplicationState.CLOSE) {
            return;
        }
        if (cmd.directory.has(commandArgs[0])) {
            this.commandArgs = commandArgs;
            this.state = ApplicationState.OPEN_APPLICATION;
        }
        else if (commandArgs[0] === cmd.RAINBOW) {
            printLine((wrapCharsWithPastelAndRainbow("Rainbow text rainbow text rainbow text.")));
        }
        else if (commandArgs[0] === cmd.CLEAR) {
            clearLog();
        }
        else {
            // noinspection GrazieInspection
            if (commandArgs[0] === "ls" || commandArgs[0] === "cd") {
                //To implement "cd .." if this is implemented as well.
                printLine("No filesystem analogue yet");
            }
            else if (commandArgs[0].trim() === "") {
                saveCommand = false;
                //do nothing.
            }
            else {
                printLine(commandArgs[0] + ': command not found');
            }
        }
        if (saveCommand) {
            this.commandHistory.add(command);
            localStorage.setItem(this.applicationName, this.commandHistory.toJSON());
        }
    }
    redraw() {
        super.redraw();
    }
    prompt() {
        return [wrapColour(this.user, '#55cc33'), ':', wrapColour(this.path, '#5566ee'), '$ '];
    }
}
cmd.applicationName = "cmd";
cmd.HELP = "help";
cmd.RAINBOW = "rainbow";
cmd.CLEAR = "clear";
cmd.COMMANDS_TO_REMEMBER = 20;
//Only the keys (the application names) will be used for now.
//The values could hold application options/a short description in the future?
cmd.directory = new Map([
    ["gurgle", ''],
    ["mm", ''],
    ["suso", ''],
    ["clock", ''],
    ["hoge", ''],
    ["help", '']
]);
