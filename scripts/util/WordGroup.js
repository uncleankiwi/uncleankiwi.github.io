

/*
Requirements:
	- Get random word of length d, of commonality c1~c2 with getRandomWord(int d, int c1, int c2)
	- Get random word of random length, of commonality c1~c2 with getRandomLengthWord(int c1, int c2)
		Every word in the range c1~c2 should have an equal chance of getting chosen, independent of word length.
	- Check if word w is present within commonality c1~c3 with isWord(String w, int c1, int c3)
 */
export class WordGroup {
	map;
	array;

	constructor() {
		this.map = new Map();
		this.array = [];
	}

	add(w) {
		this.map.add(w);
		this.array.push(w);
	}

	size() {
		return this.map.size();
	}

	isWord(w) {
		return this.map.has(w);
	}
}