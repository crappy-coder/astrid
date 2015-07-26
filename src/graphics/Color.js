import Equatable from "../Equatable";
import { ValueOrDefault } from "../Engine";

class Color extends Equatable {
	constructor(r, g, b, a) {
		super();
		this.r = ValueOrDefault(r, 1.0);
		this.g = ValueOrDefault(g, 1.0);
		this.b = ValueOrDefault(b, 1.0);
		this.a = ValueOrDefault(a, 1.0);
	}

	add(color) {
		return new Color(
			Math.min(this.r + color.r, 1.0),
			Math.min(this.g + color.g, 1.0),
			Math.min(this.b + color.b, 1.0),
			Math.min(this.a + color.a, 1.0));
	}

	subtract(color) {
		return new Color(
			Math.max(this.r - color.r, 0.0),
			Math.max(this.g - color.g, 0.0),
			Math.max(this.b - color.b, 0.0),
			Math.max(this.a - color.a, 0.0));
	}

	toRGB() {
		return (((this.r * 255) << 16) | ((this.g * 255) << 8) | (this.b * 255));
	}

	toRGBString() {
		return "rgb(" + parseInt(this.r * 255) + "," + parseInt(this.g * 255) + "," + parseInt(this.b * 255) + ")";
	}

	toRGBAString() {
		return "rgba(" + parseInt(this.r * 255) + "," + parseInt(this.g * 255) + "," + parseInt(this.b * 255) + "," +
			Math.max(Math.min(this.a.toFixed(2), 1.0), 0.0) + ")";
	}

	toHex() {
		return "#" + this.toRGB().toString(16);
	}

	isEqualTo(color) {
		return (color.r == this.r && color.g == this.g && color.b == this.b && color.a == this.a);
	}

	toString() {
		return this.toRGBString();
	}

	static fromColor(color) {
		return new Color(color.r, color.g, color.b, color.a);
	}

	static fromRGB(value) {
		return new Color(
			((value >> 16) & 0xff) / 255,
			((value >> 8) & 0xff) / 255,
			((value & 0xff)) / 255, 1);
	}

	static fromCSSColor(value) {
		if (!value) {
			return Color.Transparent;
		}

		if (value[0] == "#") {
			return Color.fromHex(value);
		}

		// parse as rgb(0,0,0) or rgba(0,0,0,0)
		var colorString = value.toLowerCase();

		if (colorString[0] == "r" && colorString[1] == "g" && colorString[2] == "b") {
			var components = value.substring(value.indexOf("(") + 1, value.length - 1).split(",");

			for (var i = 0; i < components.length; ++i) {
				components[i] = components[i].replace(" ", "");
			}

			var r = components[0];
			var g = components[1];
			var b = components[2];
			var a = components.length > 3 ? components[3] : "1";

			return new Color(
				parseInt(r) / 255,
				parseInt(g) / 255,
				parseInt(b) / 255,
				parseFloat(a));
		}

		return Color.Transparent;
	}

	static fromHSV(h, s, v, a) {
		s = Math.max(0.0, Math.min(1.0, s));
		v = Math.max(0.0, Math.min(1.0, v));

		if (s > 0) {
			h = ((h < 0) ? h % 360 + 360 : h % 360) / 60;

			if (h < 1) {
				return new Color(
					(v),
					(v * (1 - s * (1 - h))),
					(v * (1 - s)), a);
			}
			else if (h < 2) {
				return new Color(
					(v * ( 1 - s * (h - 1) )),
					(v),
					(v * ( 1 - s )), a);
			}
			else if (h < 3) {
				return new Color(
					(v * ( 1 - s )),
					(v),
					(v * ( 1 - s * (3 - h) )), a);
			}
			else if (h < 4) {
				return new Color(
					(v * ( 1 - s )),
					(v * ( 1 - s * (h - 3) )),
					(v), a);
			}
			else if (h < 5) {
				return new Color(
					(v * ( 1 - s * (5 - h) )),
					(v * ( 1 - s )),
					(v), a);
			}
			else {
				return new Color(
					(v),
					(v * ( 1 - s )),
					(v * ( 1 - s * (h - 5) )), a);
			}
		}

		return new Color(v, v, v, a);
	}

	static fromHex(value) {

		if (value.length == 9) {
			// # + 8 color components (includes an alpha)
			return new Color(
				parseInt('0x' + value.substring(1, 3)) / 255,
				parseInt('0x' + value.substring(3, 5)) / 255,
				parseInt('0x' + value.substring(5, 7)) / 255,
				parseInt('0x' + value.substring(7, 9)) / 255);
		}
		else {
			// # + 6 color components
			return new Color(
				parseInt('0x' + value.substring(1, 3)) / 255,
				parseInt('0x' + value.substring(3, 5)) / 255,
				parseInt('0x' + value.substring(5, 7)) / 255, 1);
		}
	}

	static fromHexWithAlpha(value, alpha) {
		var color = Color.fromHex(value);
		color.a = alpha;

		return color;
	}

	static multiply255(a, b) {
		var v = a * b + 128;
		return ((v >> 8) + v) >> 8;
	}

	// helper functions to initialize a color variable with a default color that
	// is expected to be changed, this way the color 'constant' doesn't also change
	// since assigning the 'constant' to a variable is by reference
	static black() {
		return Color.fromColor(Color.Black);
	}

	static white() {
		return Color.fromColor(Color.White);
	}

	static red() {
		return Color.fromColor(Color.Red);
	}

	static green() {
		return Color.fromColor(Color.Green);
	}

	static blue() {
		return Color.fromColor(Color.Blue);
	}

	static yellow() {
		return Color.fromColor(Color.Yellow);
	}

	static magenta() {
		return Color.fromColor(Color.Magenta);
	}

	static turquoise() {
		return Color.fromColor(Color.Turquoise);
	}

	static transparent() {
		return Color.fromColor(Color.Transparent);
	}
}

Color.Black = new Color(0, 0, 0, 1);
Color.White = new Color(1, 1, 1, 1);
Color.Red = new Color(1, 0, 0, 1);
Color.Green = new Color(0, 1, 0, 1);
Color.Blue = new Color(0, 0, 1, 1);
Color.Yellow = new Color(1, 1, 0, 1);
Color.Magenta = new Color(1, 0, 1, 1);
Color.Turquoise = new Color(0, 1, 1, 1);
Color.Transparent = new Color(0, 0, 0, 0);

export default Color;
