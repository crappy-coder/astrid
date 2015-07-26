import Event from "../Event";
import Rectangle from "../Rectangle";

class EntityQueryEvent extends Event {
	constructor(type, entityFixture, bubbles, cancelable) {
		super(type, bubbles, cancelable);
		
		this.entityFixture = entityFixture;
		this.queryRect = Rectangle.Empty();
	}
	
	getQueryRect() {
		return this.queryRect;
	}
	
	getEntity() {
		return this.entityFixture.getEntity();
	}
	
	getEntityFixture() {
		return this.entityFixture;
	}
}

EntityQueryEvent.REPORT = "report";
