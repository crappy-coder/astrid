import EventDispatcher from "./EventDispatcher";

class NamedObject extends EventDispatcher {
	constructor(name) {
		super();

		this.name = name;
		this.index = 0;
	}

	getName() {
		return this.name;
	}

	setName(value) {
		this.name = value;
	}

	isEqualTo(obj) {
		return (this == obj);
	}

	toString() {
		return this.name;
	}
}

export default NamedObject;
