MoNamedObjectCollection = Class.create(MoNamedObject, {
	initialize : function($super, name_) {
		$super(name_);
		
		this.children = [];
	},

	add : function(obj) {
		this.addAt(obj, this.children.length);
	},

	addAt : function(obj, idx) {
		if(!this.exists(obj))
		{
			var newIndex = idx;

			if(newIndex >= this.children.length)
			{
				newIndex = this.children.length;
				this.children.push(obj);
			}
			else
			{
				this.children.splice(newIndex, 0, obj);
			}
			
			this.onChildAdded(obj, newIndex);
		}
	},

	remove : function(obj) {
		
		var item = null;

		if(!this.isEmpty())
		{
			var idx = this.children.indexOf(obj);

			if(idx != -1)
			{
				var removed = this.children.splice(idx, 1);

				if(removed != null && removed.length > 0)
				{
					item = removed[0];

					this.onChildRemoved(item, idx);
				}
			}
		}

		return item;
	},

	removeAt : function(idx) {
		return this.remove(this.getAt(idx));
	},

	removeByName : function(name) {
		return this.remove(this.getByName(name));
	},

	getAt : function(idx) {
		if(idx < this.children.length)
			return this.children[idx];

		return null;
	},

	getByName : function(name) {

		for(var i = 0, len = this.children.length; i < len; ++i)
		{
			var item = this.children[i];

			if(item.name == name)
				return item;
		}

		return null;
	},

	indexOf : function(obj) {
		return this.children.indexOf(obj);
	},

	clear : function() {
		for(var i = 0, len = this.getCount(); i < len; ++i)
			this.removeAt(0);
	},

	isEmpty : function() {
		return (this.children.length == 0);
	},

	exists : function(obj) {
		if(obj == null)
			return false;

		if(!this.isEmpty())
			return (this.children.indexOf(obj) != -1);

		return false;
	},

	getCount : function() {
		return this.children.length;
	},

	sort : function(sortFunc) {
		this.children.sort(sortFunc);
	},

	toString : function() {
		var str = "collection size: " + this.getCount();
		str += "\n";

		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			var child = this.children[i];
			str += "\t[" + child.index + "] ";
			str += child.name;
			str += "\n";
		}

		return str;
	},

	onChildAdded : function(obj, idx) {
		this.dispatchEvent(new MoCollectionEvent(MoCollectionEvent.ITEM_ADDED, -1, idx));
	},

	onChildRemoved : function(obj, idx) {
		this.dispatchEvent(new MoCollectionEvent(MoCollectionEvent.ITEM_REMOVED, idx, -1));
	},

	onChildIndexChanged : function(oldIndex, newIndex) {
		this.dispatchEvent(new MoCollectionEvent(MoCollectionEvent.ITEM_INDEX_CHANGED, oldIndex, newIndex));
	}
});