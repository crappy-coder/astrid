import EventDispatcher from "../EventDispatcher";
import Matrix2D from "../Matrix2D";
import Animatable from "../animation/Animatable";

class Transform extends EventDispatcher {
	constructor() {
		super();
		
		/** Matrix2D **/
		this.identity = Matrix2D.createIdentity();
		
		this.initializeAnimatableProperties();
	}
	
	getValue() {
		/** override **/
		return this.identity;
	}
	
	transformPoint(point) {
		return this.getValue().transformPoint(point);
	}
	
	transformRect(rect) {
		return this.getValue().transformRect(rect);
	}
}

Object.assign(Transform.prototype, Animatable);

export default Transform;
