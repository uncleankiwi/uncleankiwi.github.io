import { Application, ApplicationState, makeRainbow, wrapColour, wrapCharsWithPastelAndRainbow } from "./helpers.js";
import { clearLog, LogNode, printLine } from "./bash.js";
var MMState;
(function (MMState) {
    MMState[MMState["TITLE"] = 0] = "TITLE";
    MMState[MMState["CHOOSE_COLOURS"] = 1] = "CHOOSE_COLOURS";
    MMState[MMState["CHOOSE_CHANCES"] = 2] = "CHOOSE_CHANCES";
    MMState[MMState["CHOOSE_PLACES"] = 3] = "CHOOSE_PLACES";
    MMState[MMState["IN_PROGRESS"] = 4] = "IN_PROGRESS";
    MMState[MMState["DONE"] = 5] = "DONE";
})(MMState || (MMState = {}));
class GameData {
    constructor() {
        this.minColours = 1;
        this.maxColours = 9;
        this.colours = 4;
        this.minChances = 1;
        this.maxChances = 20;
        this.chances = 6;
        this.minPlaces = 1;
        this.maxPlaces = 9;
        this.places = 4;
        this.won = false;
        this.lost = false;
        this.answer = []; //Holds the answer.
        this.attemptCount = 0;
        this.attempts = []; //Holds the attempts; each attempt is also a [];
        this.grades = []; //Holds the grades for each attempt; each grade is also a [];
    }
    chancesLeft() {
        return this.chances - this.attemptCount;
    }
    pickNumbers() {
        for (let i = 0; i < this.places; i++) {
            this.answer[i] = 1 + Math.floor(Math.random() * (this.colours));
        }
    }
    //Parse the first 'places' non-space characters and puts them in an array.
    parseDigits(inputString) {
        let output = [];
        let stringIndex = 0;
        for (let arrIndex = 0; arrIndex < this.places; arrIndex++) {
            //If input string is too short for the answer, fill the rest of the places with '?'.
            if (stringIndex >= inputString.length) {
                output[arrIndex] = '?';
            }
            else {
                //Put the character in and skip any spaces.
                if (inputString.charAt(stringIndex) !== ' ') {
                    let k = parseInt(inputString.charAt(stringIndex));
                    if (Number.isNaN(k)) {
                        output[arrIndex] = inputString.charAt(stringIndex);
                    }
                    else {
                        output[arrIndex] = k;
                    }
                }
                else {
                    arrIndex--;
                }
                stringIndex++;
            }
        }
        this.attempts[this.attemptCount - 1] = output;
    }
    //If any character is not a digit within maxColours and minColours, return null.
    //This is for balance purposes - the user could just enter invalid characters to guess particular
    //positions and colours otherwise.
    grade() {
        //Checking if every input is valid
        let previousGrade = [];
        let previousAttempt = this.attempts[this.attemptCount - 1];
        let attemptMap = new Map();
        let answerMap = new Map();
        let correctColourAndPos = 0;
        let correctColour = 0;
        for (let i = 0; i < this.places; i++) {
            let attemptToken = previousAttempt[i];
            if (typeof (attemptToken) === "number" && attemptToken >= 1 && attemptToken <= this.colours) {
                let answerToken = this.answer[i];
                if (attemptToken === answerToken) {
                    //Go through each position, and if it's correct, increment correctColourAndPos.
                    correctColourAndPos++;
                }
                else {
                    //If it's not an exact match, put the token in the attempt and the answer into a map.
                    this.incrementMap(attemptMap, attemptToken);
                    this.incrementMap(answerMap, answerToken);
                }
            }
            else {
                //Bumped into an invalid output, so dump everything.
                previousGrade = null;
                break;
            }
        }
        //Increment correctColour based on the two maps.
        if (previousGrade != null) {
            attemptMap.forEach(function (value, key) {
                if (typeof (key) === "number" && answerMap.has(key)) {
                    correctColour += Math.min(value, answerMap.get(key));
                }
            });
            previousGrade = [correctColourAndPos, correctColour];
        }
        this.grades[this.attemptCount - 1] = previousGrade;
        //Check if round is won.
        if (correctColourAndPos >= this.places) {
            this.won = true;
        }
        //Check if user is out of turns and did not win i.e. round is lost.
        else if (this.attemptCount >= this.chances) {
            this.lost = true;
        }
    }
    incrementMap(map, k) {
        if (map.has(k)) {
            map.set(k, map.get(k) + 1);
        }
        else {
            map.set(k, 1);
        }
    }
}
export class mm extends Application {
    constructor() {
        super();
        this.gameState = MMState.TITLE;
        this.gameData = new GameData();
        this.titleString = "Press Enter to begin, or 'q' to quit.";
        this.setupStringPossibleColours = "Enter 'd' to start with default settings, " +
            "or enter a number from 1-9 for the number of token types. " +
            "(Default: 4)";
        this.setupStringChances = "Enter a number from 1-20 for the number of tries. " +
            "(Default: 6)";
        this.setupStringPlaces = "Enter a number from 1-9 for the number of tokens. " +
            "(Default: 4)";
        this.inProgressString1 = "Enter "; //+ this.gameData.places
        this.inProgressString2 = " digits from 1 to "; // + this.gameData.colours
        this.inProgressString3 = " : ";
        this.winString = makeRainbow(wrapCharsWithPastelAndRainbow("You win!"));
        this.loseString = wrapColour("You lose...", "#555555");
        this.nextGameString = "Press Enter to begin another game, or 'q' to quit.";
    }
    evaluate(command) {
        super.evaluate(command);
        if (this.state === ApplicationState.CLOSE) {
            clearLog();
            printLine("mm closing.");
            return;
        }
        switch (this.gameState) {
            case MMState.TITLE:
                clearLog();
                if (command === 'q') {
                    this.state = ApplicationState.CLOSE;
                    return;
                }
                else {
                    this.gameData = new GameData();
                    this.gameState = MMState.CHOOSE_COLOURS;
                }
                break;
            case MMState.CHOOSE_COLOURS:
                if (command === 'd') {
                    this.gameData.pickNumbers();
                    this.gameState = MMState.IN_PROGRESS;
                    clearLog();
                    return;
                }
                let x = parseInt(command);
                if (x >= this.gameData.minColours && x <= this.gameData.maxColours) {
                    this.gameData.colours = x;
                }
                this.gameState = MMState.CHOOSE_CHANCES;
                break;
            case MMState.CHOOSE_CHANCES:
                let y = parseInt(command);
                if (y >= this.gameData.minChances && y <= this.gameData.maxChances) {
                    this.gameData.chances = y;
                }
                this.gameData.attemptCount = 0;
                this.gameState = MMState.CHOOSE_PLACES;
                break;
            case MMState.CHOOSE_PLACES:
                let z = parseInt(command);
                if (z >= this.gameData.minPlaces && z <= this.gameData.maxPlaces) {
                    this.gameData.places = z;
                }
                this.gameData.pickNumbers();
                this.gameState = MMState.IN_PROGRESS;
                clearLog();
                break;
            case MMState.IN_PROGRESS:
                // if (this.gameData.toClearLog) {
                //
                // 	this.gameData.toClearLog = false;
                // }
                this.gameData.attemptCount++;
                this.gameData.parseDigits(command);
                this.gameData.grade();
                if (this.gameData.won || this.gameData.lost) {
                    this.gameState = MMState.DONE;
                }
                // printLine(this.gameData.attempts[this.gameData.attemptCount - 1] +
                // 	" Grade: " + this.gameData.grades[this.gameData.attemptCount - 1] +
                // 	" Chances left: " + this.gameData.chancesLeft());
                clearLog();
                this.printState();
                break;
            case MMState.DONE:
                clearLog();
                if (command === 'q') {
                    this.state = ApplicationState.CLOSE;
                    return;
                }
                else {
                    this.gameData = new GameData();
                    this.gameState = MMState.CHOOSE_COLOURS;
                }
                break;
            default:
                throw "Unknown game state at prompt(): " + this.gameState;
        }
    }
    prompt() {
        switch (this.gameState) {
            case MMState.TITLE:
                return [this.titleString];
            case MMState.CHOOSE_COLOURS:
                return [this.setupStringPossibleColours];
            case MMState.CHOOSE_CHANCES:
                return [this.setupStringChances];
            case MMState.CHOOSE_PLACES:
                return [this.setupStringPlaces];
            case MMState.IN_PROGRESS:
                return [this.inProgressString1 + this.gameData.places + this.inProgressString2
                        + this.gameData.colours + this.inProgressString3];
            case MMState.DONE:
                let output = [];
                if (this.gameData.won) {
                    output.push(this.winString);
                }
                else if (this.gameData.lost) {
                    output.push(this.loseString);
                }
                output.push(" ");
                output.push(this.nextGameString);
                return output;
            default:
                throw "Unknown game state at prompt(): " + this.gameState;
        }
    }
    redraw() {
        super.redraw();
        this.updateColour(new Date());
    }
    //Print out all attempts so far and their grade, plus the attemptsCount at the bottom.
    printState() {
        for (let i = 0; i < this.gameData.attemptCount; i++) {
            let row = "";
            let attempt = this.gameData.attempts[i];
            let grade = this.gameData.grades[i];
            for (let j = 0; j < attempt.length; j++) {
                row += this.wrapToken(attempt[j]) + " ";
            }
            row += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            if (grade === null) {
                row += "Invalid input";
            }
            else {
                row += grade[0] + "✓ " + grade[1] + "×";
            }
            printLine(row);
        }
        let strStats = this.gameData.chancesLeft() + " chances left.";
        if (this.gameData.lost) {
            strStats += " Answer: " + this.gameData.answer;
        }
        printLine(strStats);
    }
    wrapToken(k) {
        return wrapColour(k, this.colourFromNumber(k));
    }
    colourFromNumber(k) {
        switch (k) {
            case 1:
                return "#aaaa55";
            case 2:
                return "#aa55aa";
            case 3:
                return "#55aaaa";
            case 4:
                return "#55aa55";
            case 5:
                return "#aa5555";
            case 6:
                return "#5555aa";
            case 7:
                return "#ff00aa";
            case 8:
                return "#aaff00";
            case 9:
                return "#00aaff";
            default:
                return "#555555";
        }
    }
}
