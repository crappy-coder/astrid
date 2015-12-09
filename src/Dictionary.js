import Utils from "./Utils"

class Dictionary {
	constructor() {
		this.state = {
			// stores entries that DO NOT use a string as the key
			objKeys:   [],
			objValues: [],

			// stores entries that DO use a string as the key
			map: Object.create(null)
		}
	}

	get count() {
		return this.keys.length;
	}

	get keys() {
		return Object.keys(this.state.map).concat(this.state.objKeys);
	}

	get values() {
		var values = Object.keys(this.state.map).map(function (k) {
			return this.state.map[k];
		}, this);

		return values.concat(this.state.objValues);
	}

	get(key) {
		if(Utils.isString(key))
			return (key in this.state.map ? this.state.map[key] : null);

		var idx = this.state.objKeys.indexOf(key);

		if(~idx)
			return this.state.objValues[idx];

		return null;
	}

	set(key, value) {
		if(Utils.isString(key)) {
			var isNewEntry = !(key in this.state.map);

			this.state.map[key] = value;
			return isNewEntry;
		}

		var idx = this.state.objKeys.indexOf(key);

		if(~idx) {
			this.state.objValues[idx] = value;
			return false;
		}

		this.state.objKeys.push(key);
		this.state.objValues.push(value);
		return true;
	}

	remove(key) {
		if(!this.exists(key))
			return false;

		if(Utils.isString(key)) {
			delete this.state.map[key];
			return true;
		}

		var idx = this.state.objKeys.indexOf(key);

		this.state.objKeys.removeAt(idx);
		this.state.objValues.removeAt(idx);
		return true;
	}

	clear() {
		this.state.objKeys.length = 0;
		this.state.objValues.length = 0;
		this.state.map = Object.create(null);
	}

	exists(key) {
		if(Utils.isString(key)) {
			return (key in this.state.map);
		}

		return !!(~this.state.objKeys.indexOf(key));
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
