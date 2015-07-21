import Event from "./Event";

class CollectionEvent extends Event {
	constructor(type, oldIndex, newIndex, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.oldIndex = oldIndex;
		this.newIndex = newIndex;
	}

	getOldIndex() {
		return this.oldIndex;
	}

	getNewIndex() {
		return this.newIndex;
	}
}

CollectionEvent.ITEM_ADDED = "collectionItemAdded";
CollectionEvent.ITEM_REMOVED = "collectionItemRemoved";
CollectionEvent.ITEM_INDEX_CHANGED = "collectionItemIndexChanged";

export default CollectionEvent;
