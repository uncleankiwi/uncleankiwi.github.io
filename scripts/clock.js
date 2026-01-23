import {Application, ApplicationState} from "./helpers.js";
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

let previousSecond;

export class clock extends Application {

	constructor() {
		super();
		this.replaceChars(BIG_NUM);
		this.replaceChars(BIG_CHAR);
	}
	evaluate(command) {
		clearLog();
		this.state = ApplicationState.CLOSE;
	}

	redraw() {
		super.redraw();
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

		this.appendNumToArray(arr, hour);
		this.appendToArray(arr, ":");
		this.appendNumToArray(arr, minute);
		this.appendToArray(arr, ":");
		this.appendNumToArray(arr, second);


		if (isAM) {
			this.appendToArray(arr,"a");
		}
		else {
			this.appendToArray(arr,"p");
		}
		this.appendToArray(arr,"m");
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
	appendNumToArray(arr, num) {
		if (num < 10) {
			this.appendToArray(arr, 0);
			this.appendToArray(arr, num);
		}
		else {
			this.appendToArray(arr, Math.floor(num / 10));
			this.appendToArray(arr, num % 10);
		}
	}

	//Translate x to its array counterpart using the constants above, then append the arrays to the given one.
	appendToArray(arr, x) {
		if (0 <= x && x <= 9) {
			this.appendWithBigArray(arr, BIG_NUM[x]);
		}
		else {
			switch (x) {
				case ":" :
					this.appendWithBigArray(arr, BIG_CHAR[0]);
					break;
				case "a" :
					this.appendWithBigArray(arr, BIG_CHAR[1]);
					break;
				case "p":
					this.appendWithBigArray(arr, BIG_CHAR[2]);
					break;
				case "m":
					this.appendWithBigArray(arr, BIG_CHAR[3]);
					break;
				default:
					throw "Cannot display unrecognized character " + x;
			}
		}
	}

	appendWithBigArray(arr, arrBig) {
		for (let i = 0; i < arr.length; i++) {
			arr[i] += arrBig[i] + "&nbsp;";
		}
	}

	//Browser (or JS?) has a habit of truncating multiple contiguous spaces into just 1.
	//So we have to replace all spaces with &nbsp; in the constants.
	//Also, non-space characters are replaced with a box for greater readability.
	replaceChars(arr) {
		for (let i = 0; i < arr.length; i++) {
			let arr2 = arr[i];
			for (let j = 0; j < arr2.length; j++) {
				arr2[j] = arr2[j].replaceAll(/\S/g,"▉");
				arr2[j] = arr2[j].replaceAll(" ","&nbsp;");
			}
		}
	}
}