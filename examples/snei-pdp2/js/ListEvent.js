import { ValueOrDefault } from "../../../src/Engine"
import Event from "../../../src/Event"

class ListEvent extends Event {
	constructor(type, fromIndex, toIndex, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.state = {
			fromIndex: ValueOrDefault(fromIndex, -1),
			toIndex: ValueOrDefault(toIndex, -1)
		};
	}

	get fromIndex() {
		return this.state.fromIndex;
	}

	get toIndex() {
		return this.state.toIndex;
	}

	toString() {
		return "ListEvent[ fromIndex=" + this.fromIndex + ", toIndex=" + this.toIndex + " ]";
	}
}

ListEvent.SELECTED_INDEX_CHANGED = "selectedIndexChanged";
ListEvent.SELECTED = "selected";

export default ListEvent;