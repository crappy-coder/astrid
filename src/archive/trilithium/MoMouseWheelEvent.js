MoMouseWheelEvent = Class.create(MoMouseEvent, {
	initialize : function($super, type, delta, x, y, modifiers, bubbles, cancelable) {
		$super(type, x, y, MoMouseButton.Middle, modifiers, bubbles, cancelable);

		this.delta = delta;
		this.direction = (delta > 0 ? MoMouseWheelDirection.Down : MoMouseWheelDirection.Up);
	}
});