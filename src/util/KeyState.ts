
export class KeyState {
	private downKeys;
	private _newestKey: string | undefined;

	constructor() {
		this.downKeys = new Set<string>;
	}

	//Is this combination of keys (and only these) currently pressed down?
	has(...keys: string[]) {
		if (keys.length === this.downKeys.size) {
			this.downKeys.forEach(k => {
				if (!this.downKeys.has(k)) {
					return false;
				}
			});
			return true;
		}
		return false;
	}

	down(key: string) {
		this.downKeys.add(key);
		if (key.length === 1) {
			this._newestKey = key;
		}
		else {
			this._newestKey = undefined;
		}
	}

	up(key: string) {
		this.downKeys.delete(key);
		this._newestKey = undefined;
	}

	//Return the newest key down, else return undefined
	get newestKey() {
		return this._newestKey;
	}
}