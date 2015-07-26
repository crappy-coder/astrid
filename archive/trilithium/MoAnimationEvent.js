MoAnimationEvent = Class.create(MoEvent, 
/**
 * @CLASS
 *
 * SUMMARY:
 *  The MoAnimation class dispatches MoAnimationEvent objects when the state of 
 *  the animation changes.
 *
 */
{
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoAnimationEvent, {

	/**
	 * SUMMARY:
	 *  Defines the value of the type property of a MoAnimationEvent object when
	 *  a MoAnimation begins playback.
	 */
	BEGIN : "animationBegin",
	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of a MoAnimationEvent object when
	 *  a MoAnimation finishes playback.
	 */
	COMPLETE : "animationComplete",
	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of a MoAnimationEvent object when
	 *  a MoAnimation is repeated.
	 */
	REPEAT : "animationRepeat",
	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of a MoAnimationEvent object when
	 *  a MoAnimation stops playback.
	 */
	STOP : "animationStop"
});