var EasingMode = {

/**
 * @CLASS
 *
 * SUMMARY:
 *	Defines the easing modes that can be applied to an MoEasingFunction.
 *
 * EXAMPLE:
 *	<code>
 *		var ease = new MoCubicEase(MoEasingMode.InOut);
 *	</code>
 *
 */

	/**
	 * SUMMARY:
	 *  Specifies that the easing instance spends the entire animation easing out.
	 */
	Out		: 0,
	
	/**
	 * SUMMARY:
	 *  Specifies that an easing instance that eases in for the first half and 
	 *  eases out for the remainder.
	 */
	InOut	: 0.5,
	
	/**
	 * SUMMARY:
	 *  Specifies that the easing instance spends the entire animation easing in.
	 */
	In		: 1
};

export default EasingMode;
