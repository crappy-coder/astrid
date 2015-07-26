MoCollectionEvent = Class.create(MoEvent, {
	initialize : function($super, type, oldIndex, newIndex, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		this.oldIndex = oldIndex;
		this.newIndex = newIndex;
	},

	getOldIndex : function() {
		return this.oldIndex;
	},

	getNewIndex : function() {
		return this.newIndex;
	}
});

Object.extend(MoCollectionEvent, {
	ITEM_ADDED : "collectionItemAdded",
	ITEM_REMOVED : "collectionItemRemoved",
	ITEM_INDEX_CHANGED : "collectionItemIndexChanged"
});