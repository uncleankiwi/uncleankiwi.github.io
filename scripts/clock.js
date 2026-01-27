import {
	animColour,
	Application,
	ApplicationState,
	makeRainbow, wrapRandomPastelColour
} from "./helpers.js";
import {clearLog, printLine} from "./bash.js";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September",
	"October","November","December"];
const BIG_NUM = [[
	"00000",
	"0   0",
	"0   0",
	"0   0",
	"00000"
],[
	" 11  ",
	"  1  ",
	"  1  ",
	"  1  ",
	" 111 "
],[
	" 222 ",
	"2   2",
	"   2 ",
	" 2   ",
	"22222"
],[
	" 333 ",
	"    3",
	"  33 ",
	"    3",
	" 333 "
],[
	"  4  ",
	" 4  4",
	"44444",
	"    4",
	"    4"
],[
	"55555",
	"5    ",
	"5555 ",
	"    5",
	"5555 "
],[
	"  6  ",
	" 6   ",
	"6 66 ",
	"6   6",
	" 666 "
],[
	"77777",
	"   7 ",
	"  7  ",
	" 7   ",
	"7    "
],[
	" 888 ",
	"8   8",
	" 888 ",
	"8   8",
	" 888 "
],[
	" 999 ",
	"9   9",
	" 99 9",
	"   9 ",
	"  9  "
]];

const BIG_CHAR = [[
	"   ",
	" : ",
	"   ",
	" : ",
	"   "
],[
	"     ",
	"     ",
	" aaa ",
	"a   a",
	" aa a"
],[
	"     ",
	" ppp ",
	"p   p",
	"p pp ",
	"p    "
],[
	"     ",
	"     ",
	" mmm ",
	"m m m",
	"m m m"
]]
let BIG_NUM_COLOUR = [];
let BIG_CHAR_COLOUR = [];

let previousSecond;

export class clock extends Application {

	constructor() {
		super();
		this.replaceCharsAndGetColourCopy(BIG_NUM, BIG_NUM_COLOUR);
		this.replaceCharsAndGetColourCopy(BIG_CHAR, BIG_CHAR_COLOUR);

		console.log(BIG_NUM_COLOUR);
	}
	evaluate(command) {
		clearLog();
		this.state = ApplicationState.CLOSE;
	}

	redraw() {
		super.redraw();
		animColour(this, new Date());
		let dateObj = new Date();
		let second = dateObj.getSeconds();

		//check if we have to redraw anything. if not, skip.
		if (previousSecond === second) {
			return;
		}
		else {
			previousSecond = second;
		}

		let hour = dateObj.getHours();
		let minute = dateObj.getMinutes();
		let day = DAYS[dateObj.getDay()];
		let date = dateObj.getDate();
		let month = MONTHS[dateObj.getMonth()];
		let year = dateObj.getFullYear();
		clearLog();
		let arr = ["","","","",""];
		let isAM = hour < 13;
		if (!isAM) {
			hour -= 12;
		}

		// Do some colours when seconds is 0<= and >=3
		let inColour = false;
		if (second >= 0 && second <= 1) {
			inColour = true;
		}

		this.appendNumToArray(arr, hour, inColour);
		this.appendToArray(arr, ":", inColour);
		this.appendNumToArray(arr, minute, inColour);
		this.appendToArray(arr, ":", inColour);
		this.appendNumToArray(arr, second, inColour);


		if (isAM) {
			this.appendToArray(arr,"a", inColour);
		}
		else {
			this.appendToArray(arr,"p", inColour);
		}
		this.appendToArray(arr,"m", inColour);


		for (let i = 0; i < arr.length; i++) {
			printLine(arr[i]);
		}
		printLine(`${day} ${date} ${month} ${year}`);
	}

	prompt() {
		return "";
	}

	//Append a number. If appending a single digit, append 0 before that.
	//Otherwise, append each digit one after another.
	appendNumToArray(arr, num, inColour) {
		if (num < 10) {
			this.appendToArray(arr, 0, inColour);
			this.appendToArray(arr, num, inColour);
		}
		else {
			this.appendToArray(arr, Math.floor(num / 10), inColour);
			this.appendToArray(arr, num % 10, inColour);
		}
	}

	//Translate x to its array counterpart using the constants above, then append the arrays to the given one.
	appendToArray(arr, x, inColour) {
		if (0 <= x && x <= 9) {
			this.appendWithBigArray(arr, BIG_NUM[x], BIG_NUM_COLOUR[x], inColour);
		}
		else {
			switch (x) {
				case ":" :
					this.appendWithBigArray(arr, BIG_CHAR[0], BIG_CHAR_COLOUR[0], inColour);
					break;
				case "a" :
					this.appendWithBigArray(arr, BIG_CHAR[1], BIG_CHAR_COLOUR[1], inColour);
					break;
				case "p":
					this.appendWithBigArray(arr, BIG_CHAR[2], BIG_CHAR_COLOUR[2], inColour);
					break;
				case "m":
					this.appendWithBigArray(arr, BIG_CHAR[3], BIG_CHAR_COLOUR[3], inColour);
					break;
				default:
					throw "Cannot display unrecognized character " + x;
			}
		}
	}

	appendWithBigArray(arr, arrBigPlain, arrBigColour, inColour) {
		for (let i = 0; i < arr.length; i++) {
			if (!inColour) {
				arr[i] += arrBigPlain[i] + "&nbsp;";
			}
			else {
				arr[i] += arrBigColour[i] + "&nbsp;";
			}

		}
	}

	//Browser (or JS?) has a habit of truncating multiple contiguous spaces into just 1.
	//So we have to replace all spaces with &nbsp; in the constants.
	//Also, non-space characters are replaced with a box for greater readability.
	//colourCopy argument is where a copy of the array - but coloured - is output.
	replaceCharsAndGetColourCopy(arr, colourCopy) {
		for (let i = 0; i < arr.length; i++) {
			let arr2 = arr[i];
			for (let j = 0; j < arr2.length; j++) {
				if (colourCopy[i] === undefined) {
					colourCopy[i] = [];
				}
				arr2[j] = arr2[j].replaceAll(/\S/g,"▉");
				arr2[j] = arr2[j].replaceAll(" ","&nbsp;");
				//Manually copy, because each character needs a different call to wrapRandomPastelColour
				//Or else the entire row will have the same colour and animation.
				colourCopy[i][j] = "";
				for (let charIndex = 0; charIndex < arr2[j].length; charIndex++) {
					let c = arr2[j].charAt(charIndex);
					if (c === "▉") {
						c = makeRainbow(wrapRandomPastelColour(c));
					}
					colourCopy[i][j] += c;
				}
			}
		}
	}
}