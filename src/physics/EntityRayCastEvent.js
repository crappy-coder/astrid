import Event from "../Event";
import Vector2D from "../Vector2D";

class EntityRayCastEvent extends Event {
	constructor(type, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.startPoint = Vector2D.Zero();
		this.endPoint = Vector2D.Zero();
		this.entityFixture = null;
		this.point = null;
		this.normal = null;
		this.distance = 0;
		this.result = 1;
	}

	getStartPoint() {
		return this.startPoint;
	}

	getEndPoint() {
		return this.endPoint;
	}

	getEntity() {
		return this.entityFixture.getEntity();
	}

	getEntityFixture() {
		return this.entityFixture;
	}

	getPoint() {
		return this.point;
	}

	getNormal() {
		return this.normal;
	}

	getDistance() {
		return this.distance;
	}

	setResult(value) {
		this.result = value;
	}
}

EntityRayCastEvent.REPORT = "reportRayCast";

export default EntityRayCastEvent;