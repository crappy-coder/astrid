import { MaxShort } from "../EngineMath";

const GamepadDeadZoneSize = {
	"None": 0,
	"LeftStick": 7849 / MaxShort,
	"RightStick": 8689 / MaxShort,
	"Trigger": 30 / 255.0
};

export default GamepadDeadZoneSize;
