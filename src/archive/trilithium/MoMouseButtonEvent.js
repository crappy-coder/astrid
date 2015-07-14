MoMouseButtonEvent = Class.create(MoMouseEvent, {
	initialize : function($super, type, button, pressed, x, y, clickCount, modifiers, bubbles, cancelable) {
		$super(type, x, y, button, modifiers, bubbles, cancelable);

		this.mouseButton = button;
		this.isDown = pressed;
		this.clickCount = MoValueOrDefault(clickCount, 1);
	}
});
