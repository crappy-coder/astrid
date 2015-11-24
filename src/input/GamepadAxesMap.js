import { ValueOrDefault } from "../Engine";
import GamepadButtons from "./GamepadButtons";

class GamepadAxesMap {
	constructor(map) {
		this.map = ValueOrDefault(map, []);
	}

	indexOf(button) {
		if (button === GamepadButtons.None) {
			return -1;
		}

		for (var i = 0, len = this.map.length; i < len; ++i) {
			if (this.map[i][0] === button) {
				return i;
			}
		}

		return -1;
	}

	get(button) {
		var idx = this.indexOf(button);

		if(idx === -1)
			return null;

		return this.map[idx][1];
	}
}

GamepadAxesMap.XBOX360 = new GamepadAxesMap([
	[GamepadButtons.LeftStick, [0,1]],
	[GamepadButtons.RightStick, [2,3]],
	[GamepadButtons.LeftTrigger, [6]],
	[GamepadButtons.RightTrigger, [7]]
]);

GamepadAxesMap.PS4 = new GamepadAxesMap([
	[GamepadButtons.LeftStick, [0,1]],
	[GamepadButtons.RightStick, [2,5]],
	[GamepadButtons.LeftTrigger, [3]],
	[GamepadButtons.RightTrigger, [4]]
]);


export default GamepadAxesMap;
