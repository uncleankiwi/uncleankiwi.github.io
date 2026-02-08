

/*
Requirements:
	- Get random word of length d, of commonality c1~c2 with getRandomWord(int d, int c1, int c2)
	- Get random word of random length, of commonality c1~c2 with getRandomLengthWord(int c1, int c2)
		Every word in the range c1~c2 should have an equal chance of getting chosen, independent of word length.
	- Check if word w is present within commonality c1~c3 with isWord(String w, int c1, int c3)
 */
import {rand} from "../helpers.js";

export class WordGroup {
	set;
	array;

	constructor() {
		this.set = new Set();
		this.array = [];
	}

	add(w) {
		this.set.add(w);
		this.array.push(w);
	}

	size() {
		return this.set.size;
	}

	isWord(w) {
		return this.set.has(w);
	}

	randomWord() {
		return this.array[rand(0, this.array.length - 1)];
	}
}