import Event from "./Event";

/**
 * SUMMARY:
 *  The Animation class dispatches AnimationEvent objects when the state of
 *  an animation changes.
 *
 */
class AnimationEvent extends Event {
	constructor(type, bubbles, cancelable) {
		super(type, bubbles, cancelable);
	}
}

/**
 * SUMMARY:
 *  Defines the value of the type property of a AnimationEvent object when
 *  an Animation begins playback.
 */
AnimationEvent.BEGIN = "animationBegin";


	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of an AnimationEvent object when
	 *  an Animation finishes playback.
	 */
AnimationEvent.COMPLETE = "animationComplete";
	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of an AnimationEvent object when
	 *  an Animation is repeated.
	 */
AnimationEvent.REPEAT = "animationRepeat";
	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of an AnimationEvent object when
	 *  an Animation stops playback.
	 */
AnimationEvent.STOP = "animationStop";

export default AnimationEvent;
