
/*
Requirements:
	- Get random word of length d, of commonality c1~c2 with getRandomWord(int d, int c1, int c2)
	- Get random word of random length, of commonality c1~c2 with getRandomLengthWord(int c1, int c2)
		Every word in the range c1~c2 should have an equal chance of getting chosen, independent of word length.
	- Check if word w is present within commonality c1~c3 with isWord(String w, int c1, int c3)
 */
import {WordGroup} from "./WordGroup";

export class Dictionary {
	static initialized = false;
	static rawDictionary;
	static wordGroups;

	static init() {
		if (Dictionary.initialized) {
			return;
		}
		Dictionary.loadDictionary().then(d => Dictionary.rawDictionary = new Map(Object.entries(d)));
		this.wordGroups = [];

		Dictionary.rawDictionary.keys().forEach(k => {
			console.log("key " + k);
		});

		Dictionary.initialized = true;
	}

	static loadDictionary() {
		return fetch("./resources/dictionary.json")
			.then(response => {
				if (!response.ok) {
					console.log(`${response.status}: failed to load dictionary.json`)
				}
				return response.json();
			});
	}


// - Get random word of length d, of commonality c1~c2 with getRandomWord(int d, int c1, int c2)
	getRandomWord(d, c1, c2) {
		//todo
	}


// - Get random word of random length, of commonality c1~c2 with getRandomLengthWord(int c1, int c2)
// 		Every word in the range c1~c2 should have an equal chance of getting chosen, independent of word length.
	getRandomLengthWord(c1, c2) {
		//todo
	}

// - Check if word w is present within commonality c1~c3 with isWord(String w, int c1, int c3)
	isWord(w, c1, c2) {
		//todo
	}
}