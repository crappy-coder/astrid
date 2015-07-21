/**
 *  Base class for all objects that require themselves to be compared against one another
 *
 * EXAMPLE:
 *  <code>
 *    class MyClass extends Equatable { ... }
 *  </code>
 */
class Equatable {
	isEqualTo(other) {
		/**
		 * SUMMARY:
		 *  Compares whether or not this instance is
		 *  equal to another.
		 *
		 * REMARKS:
		 *  When not implemented in a subclass the default value is true.
		 *
		 * PARAMS:
		 *  Object other = null:
		 *    The other object that you wish to compare this
		 *    instance to
		 *
		 * RETURNS (Boolean):
		 *  true if the objects are equal; otherwise false.
		 *
		 */

		return true;
	}

	isNotEqualTo(other) {
		/**
		 * SUMMARY:
		 *  Compares whether or not this instance is not equal to another.
		 *
		 * REMARKS:
		 *  When not implemented in a subclass the default value is false.
		 *
		 * PARAMS:
		 *  Object other:
		 *    The other object that you wish to compare this
		 *    instance to
		 *
		 * RETURNS:
		 *  true if the objects are not equal; otherwise false.
		 */

		return !this.isEqualTo(other);
	}

	copy() {
		return Object.clone(this);
	}

	/*
	 * helper method to copy the properties of 'other' object
	 * into this object, i.e. by-value
	 */
	copyFrom(other) {
		for (var p in other) {
			if (typeof other[p] != "function") {
				this[p] = other[p];
			}
		}
	}
}

export default Equatable;
