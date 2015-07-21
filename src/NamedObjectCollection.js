import NamedObject from "./NamedObject";
import CollectionEvent from "./CollectionEvent";

class NamedObjectCollection extends NamedObject {
	constructor(name_) {
		super(name_);

		this.children = [];
	}

	add(obj) {
		this.addAt(obj, this.children.length);
	}

	addAt(obj, idx) {
		if (!this.exists(obj)) {
			var newIndex = idx;

			if (newIndex >= this.children.length) {
				newIndex = this.children.length;
				this.children.push(obj);
			}
			else {
				this.children.splice(newIndex, 0, obj);
			}

			this.onChildAdded(obj, newIndex);
		}
	}

	remove(obj) {

		var item = null;

		if (!this.isEmpty()) {
			var idx = this.children.indexOf(obj);

			if (idx != -1) {
				var removed = this.children.splice(idx, 1);

				if (removed != null && removed.length > 0) {
					item = removed[0];

					this.onChildRemoved(item, idx);
				}
			}
		}

		return item;
	}

	removeAt(idx) {
		return this.remove(this.getAt(idx));
	}

	removeByName(name) {
		return this.remove(this.getByName(name));
	}

	getAt(idx) {
		if (idx < this.children.length) {
			return this.children[idx];
		}

		return null;
	}

	getByName(name) {

		for (var i = 0, len = this.children.length; i < len; ++i) {
			var item = this.children[i];

			if (item.name == name) {
				return item;
			}
		}

		return null;
	}

	indexOf(obj) {
		return this.children.indexOf(obj);
	}

	clear() {
		this.children.clear();
	}

	isEmpty() {
		return (this.children.length == 0);
	}

	exists(obj) {
		if (obj == null) {
			return false;
		}

		if (!this.isEmpty()) {
			return (this.children.indexOf(obj) != -1);
		}

		return false;
	}

	getCount() {
		return this.children.length;
	}

	sort(sortFunc) {
		this.children.sort(sortFunc);
	}

	toString() {
		var str = "collection size: " + this.getCount();
		str += "\n";

		for (var i = 0, len = this.getCount(); i < len; ++i) {
			var child = this.children[i];
			str += "\t[" + child.index + "] ";
			str += child.name;
			str += "\n";
		}

		return str;
	}

	onChildAdded(obj, idx) {
		this.dispatchEvent(new CollectionEvent(CollectionEvent.ITEM_ADDED, -1, idx));
	}

	onChildRemoved(obj, idx) {
		this.dispatchEvent(new CollectionEvent(CollectionEvent.ITEM_REMOVED, idx, -1));
	}

	onChildIndexChanged(oldIndex, newIndex) {
		this.dispatchEvent(new CollectionEvent(CollectionEvent.ITEM_INDEX_CHANGED, oldIndex, newIndex));
	}
}

export default NamedObjectCollection;
