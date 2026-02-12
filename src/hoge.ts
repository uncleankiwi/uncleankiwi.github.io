import {Application} from "./helpers.js";
import {printLine} from "./bash.js";
import { KeyState } from "./util/KeyState.js";

const A = "A";
const B = "B";
const C = "C";
const D = "D";

export class hoge extends Application {
	one: string | undefined;
	two: string | undefined;
	oneArr: string[] | undefined;
	twoMap: Map<string, string[]> | undefined;
	readRow = 0;
	a = "";
	b = "";
	c = "";
	threeArr: { [x: string]: any; }[] | { A: string; B: string; C: string; D: string; }[] | undefined;

	evaluate(command: string) {
		super.evaluate(command);
		printLine("(unimplemented) evaluate");
	}

	prompt() {
		return ["(unimplemented) prefix"];
	}

	onKeyDown(keyState: KeyState, e: KeyboardEvent) {
		super.onKeyDown(keyState, e);
		if (keyState.Control && e.key === 'v') {
			let p = navigator.clipboard.readText();
			if (this.one === undefined) {
				p.then((value) => {
					this.one = value;
				});
			}
			else if (this.two === undefined) {
				p.then((value) => {
					this.two = value;
					this.concatenate();
				});
			}
		}
	}

	concatenate() {
		this.oneArr = (this.one as string).split("\n");
		this.twoMap = new Map();
		this.threeArr = [];
		this.parseTwo();
		for (; this.readRow < this.oneArr.length; this.readRow++) {
			let aStart;
			let aEnd;

			if (this.oneArr[this.readRow] === "") {
				break;
			}
			for (; this.readRow < this.oneArr.length && !this.oneArr[this.readRow].includes(","); this.readRow++) {}
			aStart = this.readRow;
			this.a = this.oneArr[this.readRow].replaceAll(" ", " ");
			if (!this.a.endsWith(",")) {
				aEnd = aStart;
			}
			else {
				aEnd = aStart + 1;
				this.a += " " + this.oneArr[aEnd];
			}

			//==============================================================================
			//check
			//==============================================================================
			for (;true;) {
				let exactMatches = 0;
				let leftMatches = 0;
				this.twoMap.forEach((_value, key) => {
					if (this.a === key) {
						exactMatches++;
					}
					else if (this.a === key.substring(0, this.a.length)) {
								leftMatches++;
					}
				});

				if (exactMatches === 1) {
					break;
				}
				else if (leftMatches >= 1 && exactMatches === 0) {
					aEnd++;
					this.a += " " + this.oneArr[aEnd];
					//back to the top of the check loop
				}
				else {
					let e = `Could not find an exact match for ${this.a} on twoArr. 
				Exact matches: ${exactMatches}, Partial matches ${leftMatches}`;
					alert(e);
					this.one = undefined;
					this.two = undefined;
					throw(e);
				}
			}


			//==============================================================================
			//endCheck
			//==============================================================================
			let bStart = aEnd + 1;
			let bEnd;
			this.readRow = bStart + 1;

			let cStart;
			let cEnd;
			let consecutive = 0;
			for (;this.readRow < this.oneArr.length && consecutive <= 4; this.readRow++) {
				let cell = this.oneArr[this.readRow];
				if (cell.length === 1) {
					consecutive++;
					if (consecutive <= 4) {
						consecutive++;
					}
					else if (consecutive >= 5) {
						cEnd = this.readRow;
						cStart = this.readRow - 5;
						bEnd = cStart - 1;

						//c found, on to populate b and c
						for (let i = bStart; i <= bEnd; i++) {
							if (i === bEnd) {
								this.b += " ";
 							}
							this.b += this.oneArr[i];
						}

						//extra space
						for (let i = cStart; i <= cEnd; i++) {
							let tempStr = this.oneArr[i];
							if (i === cStart) {
								this.c += tempStr.substring(0, tempStr.length - 1) + " " +
									tempStr.substring(tempStr.length - 1);
							}
							else {
								this.c += this.oneArr[i];
							}
						}
					}
				}
				else {
					consecutive = 0;
				}
			}

			this.threeArr.push({A:this.a,B:this.b,C:this.c,D:""});
			this.a = "";
			this.b = "";
			this.c = "";
		}

		//=======================================================
		//Matching, part 2
		//=======================================================
		for (let i = 0; i < this.threeArr.length; i++) {
			let threeRow = this.threeArr[i];
			let aToLookup = threeRow[A];

			//look up every entry in Two
			if (this.twoMap.has(aToLookup)) {
				let twoValue: string[] | undefined = this.twoMap.get(aToLookup);
				if (twoValue === undefined) {
					let e = "Could not look up A" + aToLookup + " in map of Two."
					alert(e);
					throw Error(e);
				}
				if (twoValue.length >= 2) {
					alert(`A ${aToLookup} occurs ${twoValue.length} times in Two. Using first instance.`);
				}
				threeRow[D] = twoValue.shift();

			}
			else {
				let e = `A ${aToLookup} not on Two`;
				alert(e);
			}
		}

		navigator.clipboard.writeText(this.stringify()).then();
	}

	parseTwo() {
		let twoArrTabbed = (this.two as string).split("\n");
		for (let i = 0; i < twoArrTabbed.length; i++) {
			let twoArrRow = twoArrTabbed[i].split("\t");
			let a = twoArrRow[3];
			let d = twoArrRow[5];
			if (a === undefined && d === undefined) {
				continue;
			}
			if (this.twoMap === undefined) {
				let e = "Two map is undefined in parseTwo()."
				alert(e);
				throw Error(e);
			}
			if (this.twoMap.has(a)) {
				alert(`Warning: Two has multiple occurrences of ${a}.`);
				(this.twoMap.get(a) as string[]).push(d);
			}
			else {
				this.twoMap.set(a, [d]);
			}
		}
	}

	stringify() {
		let output = ""
		if (this.threeArr === undefined) {
			let e = "Two map is undefined in parseTwo()."
			alert(e);
			throw Error(e);
		}
		for (let i = 0; i < this.threeArr.length; i++) {
			if (i !== 0) {
				output += "\n";
			}
			output += `${this.threeArr[i][A]}\t${this.threeArr[i][B]}\t${this.threeArr[i][C]}\t${this.threeArr[i][D]}`;
		}
		return output;
	}
}