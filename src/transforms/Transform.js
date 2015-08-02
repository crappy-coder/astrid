import EventDispatcher from "../EventDispatcher";
import Matrix2D from "../Matrix2D";
import Animatable from "../animation/Animatable";
import { Mixin } from "../Engine";

var Mixed = Mixin(EventDispatcher, Animatable);

class Transform extends Mixed {
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

export default Transform;
