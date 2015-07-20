class Dictionary {
	constructor() {
		this.keys = [];
		this.values = [];
	}

	getKeys() {
		return this.keys;
	}

	getValues() {
		return this.values;
	}

	getCount() {
		return this.keys.length;
	}

	get(key) {
		var idx = this.keys.indexOf(key);

		if (idx == -1) {
			return null;
		}

		return this.values[idx];
	}

	set(key, value) {
		var idx = this.keys.indexOf(key);

		if (idx == -1) {
			this.keys.push(key);
			this.values.push(value);
		}
		else {
			this.values[idx] = value;
		}
	}

	remove(key) {
		var idx = this.keys.indexOf(key);

		if (idx != -1) {
			this.keys.removeAt(idx);
			this.values.removeAt(idx);
		}
	}

	clear() {
		this.keys = [];
		this.values = [];
	}

	containsKey(key) {
		return (this.keys.indexOf(key) != -1);
	}

	containsValue(value) {
		return (this.values.indexOf(value) != -1);
	}

	toString() {
		var str = "Dictionary (count=" + this.getCount() + ") :\n";
		var len = this.getCount();
		var key = null;
		var value = null;

		for (var i = 0; i < len; i++) {
			key = this.keys[i];
			value = this.values[i];

			str += "[key=" + key + ", value=" + value + "]\n";
		}

		return str;
	}
}

export default Dictionary;
