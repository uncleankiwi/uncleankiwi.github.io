import { Dictionary } from "./Dictionary.js";
import { makeRainbow, padToCentre, wrapColour, wrapRandomPastelColour } from "../helpers.js";
import { printLine } from "../bash.js";
var LETTER_GRADE;
(function (LETTER_GRADE) {
    LETTER_GRADE[LETTER_GRADE["DEFAULT"] = 0] = "DEFAULT";
    LETTER_GRADE[LETTER_GRADE["CORRECT"] = 1] = "CORRECT";
    LETTER_GRADE[LETTER_GRADE["WRONG_LOC"] = 2] = "WRONG_LOC";
    LETTER_GRADE[LETTER_GRADE["WRONG"] = 3] = "WRONG";
})(LETTER_GRADE || (LETTER_GRADE = {}));
const KEYBOARD_UPPER = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const KEYBOARD_MID = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
const KEYBOARD_LOWER = ["z", "x", "c", "v", "b", "n", "m"];
export class GurgleGame {
    //Start a new game with word length l, and commonality ranging between c1 and c2 inclusive.
    //Attempts made will be checked against commonality range c1 to c3.
    constructor(l, c1, c2, c3) {
        this.c1 = c1;
        this.c2 = c2;
        this.c3 = c3;
        this.won = false;
        this.lost = false;
        this.answer = Dictionary.getRandomWord(l, c1, c2);
        this.answerArr = [...this.answer];
        this.keyStatus = new Map();
        this.statusDisplay = "";
        this.setKeyToDefault(KEYBOARD_UPPER);
        this.setKeyToDefault(KEYBOARD_MID);
        this.setKeyToDefault(KEYBOARD_LOWER);
        this.defaultAttempt = [];
        this.defaultGrade = [];
        for (let i = 0; i < this.answer.length; i++) {
            this.defaultAttempt.push("_");
            this.defaultGrade.push(LETTER_GRADE.DEFAULT);
        }
        this.attempts = [];
        this.grades = [];
    }
    setKeyToDefault(keyArr) {
        keyArr.forEach(k => { this.keyStatus.set(k, LETTER_GRADE.DEFAULT); });
    }
    grade(attempt) {
        if (this.won || this.lost) {
            return;
        }
        //Check if it's a word of suitable length and is in the word lists within the c1~c3 range.
        if (attempt.length !== this.answer.length) {
            this.statusDisplay = "Word length wrong.";
            return;
        }
        if (!Dictionary.isWord(attempt, this.c1, this.c3)) {
            this.statusDisplay = attempt + " is not in word list.";
            return;
        }
        this.statusDisplay = "";
        let attemptArr = [...attempt]; //Splits the attempt into individual characters
        let gradeArr = [];
        this.attempts.push(attemptArr);
        let anyWrongChar = false;
        for (let i = 0; i < attemptArr.length; i++) {
            let c = attemptArr[i];
            if (c === this.answerArr[i]) {
                this.keyStatus.set(c, LETTER_GRADE.CORRECT);
                gradeArr.push(LETTER_GRADE.CORRECT);
            }
            else if (this.answer.includes(c)) {
                this.keyStatus.set(c, LETTER_GRADE.CORRECT);
                gradeArr.push(LETTER_GRADE.WRONG_LOC);
                anyWrongChar = true;
            }
            else {
                this.keyStatus.set(c, LETTER_GRADE.WRONG);
                gradeArr.push(LETTER_GRADE.WRONG);
                anyWrongChar = true;
            }
        }
        this.grades.push(gradeArr);
        //Check for win
        if (!anyWrongChar) {
            this.won = true;
            this.statusDisplay = makeRainbow(wrapRandomPastelColour("You win!"));
        }
        //check for loss
        else if (this.grades.length >= GurgleGame.MAX_ATTEMPTS) {
            this.lost = true;
            this.statusDisplay = wrapColour("You lose...", "#555555") + " Answer: " + this.answer;
        }
    }
    draw() {
        //Draw attempts and grades
        for (let i = 0; i < GurgleGame.MAX_ATTEMPTS; i++) {
            if (this.attempts[i] === undefined) {
                GurgleGame.printAttemptLine(this.defaultAttempt, this.defaultGrade);
            }
            else {
                GurgleGame.printAttemptLine(this.attempts[i], this.grades[i]);
            }
        }
        //Draw keyboard and keyStatus
        printLine("");
        GurgleGame.printKeyboardRow(KEYBOARD_UPPER, this.keyStatus);
        GurgleGame.printKeyboardRow(KEYBOARD_MID, this.keyStatus);
        GurgleGame.printKeyboardRow(KEYBOARD_LOWER, this.keyStatus);
        //Print status bar
        printLine(this.statusDisplay);
    }
    static printAttemptLine(charArr, gradeArr) {
        let output = "";
        for (let i = 0; i < charArr.length; i++) {
            if (i !== 0) {
                output += "&nbsp;";
            }
            let c = charArr[i];
            let colour;
            switch (gradeArr[i]) {
                case LETTER_GRADE.DEFAULT:
                    //Nothing.
                    break;
                case LETTER_GRADE.CORRECT:
                    colour = "#00dd55";
                    break;
                case LETTER_GRADE.WRONG_LOC:
                    colour = "#cccc00";
                    break;
                case LETTER_GRADE.WRONG:
                    colour = "#555555";
                    break;
                default:
                    colour = "#ff0000";
                    break;
            }
            output += wrapColour(c, colour);
        }
        printLine(padToCentre(output));
    }
    static printKeyboardRow(keyArr, keyStatus) {
        let output = "";
        for (let i = 0; i < keyArr.length; i++) {
            if (i !== 0) {
                output += "&nbsp;";
            }
            let c = keyArr[i];
            let colour;
            switch (keyStatus.get(c)) {
                case LETTER_GRADE.DEFAULT:
                    colour = "#ffffff";
                    break;
                case LETTER_GRADE.CORRECT:
                    colour = "#00ff00";
                    break;
                case LETTER_GRADE.WRONG:
                    colour = "#555555";
                    break;
                default:
                    colour = "#ff0000";
                    break;
            }
            output += wrapColour(c.toUpperCase(), colour);
        }
        printLine(padToCentre(output));
    }
}
GurgleGame.MAX_ATTEMPTS = 6;
