class Stack {
	constructor() {
		this.stackImpl = [];
		this.size = 0;
	}

	getCount() {
		return this.size;
	}

	isEmpty() {
		return (this.getCount() == 0);
	}

	peek() {
		if (this.size == 0) {
			throw new Error("Unable to peek at stack, stack is empty.");
		}

		return this.stackImpl[this.size - 1];
	}

	pop() {
		if (this.size == 0) {
			throw new Error("Unable to peek at stack, stack is empty.");
		}

		var obj = this.stackImpl[--this.size];
		this.stackImpl[this.size] = null;
		this.stackImpl.length = this.size;

		return obj;
	}

	push(obj) {
		this.stackImpl.push(obj);
		this.size++;
	}

	contains(obj) {
		return this.stackImpl.contains(obj);
	}

	clear() {
		this.stackImpl.clear();
		this.size = 0;
	}

	clone() {
		var stack = new Stack();
		stack.size = this.size;
		stack.stackImpl = this.stackImpl.concat();

		return stack;
	}

	copyTo(array, atIndex) {
		if (array != null) {
			for (var i = 0; i < this.size; i++) {
				array[atIndex + i] = this.stackImpl[i];
			}
		}
	}

	toArray() {
		return this.stackImpl.concat();
	}

	toString() {
		return "Stack[ size=" + this.size + " ]";
	}
}

export default Stack;
