
/*
Requirements:
	- Get random word of length d, of commonality c1~c2 with getRandomWord(int d, int c1, int c2)
	- Get random word of random length, of commonality c1~c2 with getRandomLengthWord(int c1, int c2)
		Every word in the range c1~c2 should have an equal chance of getting chosen, independent of word length.
	- Check if word w is present within commonality c1~c3 with isWord(String w, int c1, int c3)
 */
import {WordGroup} from "./WordGroup.js";
import {rand} from "../helpers.js";

export class Dictionary {
	static initialized = false;
	static rawDictionary;
	static wordGroups;

	static async init() {
		if (Dictionary.initialized) {
			return;
		}
		let data = await Dictionary.loadDictionary();
		Dictionary.rawDictionary = new Map(Object.entries(data));
		this.wordGroups = [];

		Dictionary.rawDictionary.forEach(function(value, key) {
			let set = new Set(value);
			let commonality = parseInt(key);
			if (Dictionary.wordGroups[commonality] === undefined) {
				Dictionary.wordGroups[commonality] = [];
			}
			set.forEach(w => {
				if (Dictionary.wordGroups[commonality][w.length] === undefined) {
					Dictionary.wordGroups[commonality][w.length] = new WordGroup();
				}
				Dictionary.wordGroups[commonality][w.length].add(w);
			});
		});

		Dictionary.initialized = true;
	}

	static async loadDictionary() {
		return fetch("./resources/dictionary.json")
			.then(response => {
				if (!response.ok) {
					console.log(`${response.status}: failed to load dictionary.json`)
				}
				return response.json();
			});
	}


// - Get random word of length d, of commonality c1~c2 with getRandomWord(int d, int c1, int c2)
	static getRandomWord(d, c1, c2) {
		let arrGroups = [];
		let arrCumulative = [];
		let cumulative = 0;
		for (let i = c1; i <= c2; i++) {
			let group = Dictionary.wordGroups[i][d];
			arrGroups.push(group);
			cumulative += group.size();
			arrCumulative.push(cumulative);
		}

		return Dictionary.findRandomWordInArrays(arrGroups, arrCumulative, cumulative);
	}

// - Get random word of random length, of commonality c1~c2 with getRandomLengthWord(int c1, int c2)
// 		Every word in the range c1~c2 should have an equal chance of getting chosen, independent of word length.
	static getRandomLengthWord(c1, c2) {
		let arrGroups = [];
		let arrCumulative = [];
		let cumulative = 0;
		for (let i = c1; i <= c2; i++) {
			for (let j = 0; j < Dictionary.wordGroups[i].length; j++) {
				let group = Dictionary.wordGroups[i][j];
				if (group !== undefined) {
					arrGroups.push(group);
					cumulative += group.size();
					arrCumulative.push(cumulative);
				}
			}
		}

		return Dictionary.findRandomWordInArrays(arrGroups, arrCumulative, cumulative);
	}

	//Given an array of WordGroups, an array of cumulative number of words in those groups, and the total
	//number of words in all of them, get a random word.
	static findRandomWordInArrays(arrGroups, arrCumulative, cumulative) {
		let result = rand(0, cumulative);
		for (let i = 0; i < arrCumulative.length; i++) {
			if (arrCumulative[i] >= result) {
				return arrGroups[i].randomWord();
			}
		}
	}

// - Check if word w is present within commonality c1~c3 with isWord(String w, int c1, int c3)
	static isWord(w, c1, c2) {
		let isWord = false;
		for (let i = c1; i <= c2; i++) {
			isWord = Dictionary.wordGroups[i][w.length].isWord(w);
			if (isWord) {
				break;
			}
		}
		return isWord;
	}
}