import EasingMode from "./EasingMode";
import BackEase from "./BackEase";
import BounceEase from "./BounceEase";
import CircEase from "./CircEase";
import CubicEase from "./CubicEase";
import ElasticEase from "./ElasticEase";
import ExpoEase from "./ExpoEase";
import LinearEase from "./LinearEase";
import QuadEase from "./QuadEase";
import QuartEase from "./QuartEase";
import QuintEase from "./QuintEase";
import SineEase from "./SineEase";

const Easing = {
	"BackIn"		: new BackEase(EasingMode.In),
	"BackOut"		: new BackEase(EasingMode.Out),
	"BackInOut"		: new BackEase(EasingMode.InOut),

	"BounceIn"		: new BounceEase(EasingMode.In),
	"BounceOut"		: new BounceEase(EasingMode.Out),
	"BounceInOut"	: new BounceEase(EasingMode.InOut),

	"CircIn"		: new CircEase(EasingMode.In),
	"CircOut"		: new CircEase(EasingMode.Out),
	"CircInOut"		: new CircEase(EasingMode.InOut),

	"CubicIn"		: new CubicEase(EasingMode.In),
	"CubicOut"		: new CubicEase(EasingMode.Out),
	"CubicInOut"	: new CubicEase(EasingMode.InOut),

	"ElasticIn"		: new ElasticEase(EasingMode.In),
	"ElasticOut"	: new ElasticEase(EasingMode.Out),
	"ElasticInOut"	: new ElasticEase(EasingMode.InOut),

	"ExpoIn"		: new ExpoEase(EasingMode.In),
	"ExpoOut"		: new ExpoEase(EasingMode.Out),
	"ExpoInOut"		: new ExpoEase(EasingMode.InOut),

	"LinearIn"		: new LinearEase(EasingMode.In),
	"LinearOut"		: new LinearEase(EasingMode.Out),
	"LinearInOut"	: new LinearEase(EasingMode.InOut),

	"QuadIn"		: new QuadEase(EasingMode.In),
	"QuadOut"		: new QuadEase(EasingMode.Out),
	"QuadInOut"		: new QuadEase(EasingMode.InOut),

	"QuartIn"		: new QuartEase(EasingMode.In),
	"QuartOut"		: new QuartEase(EasingMode.Out),
	"QuartInOut"	: new QuartEase(EasingMode.InOut),

	"QuintIn"		: new QuintEase(EasingMode.In),
	"QuintOut"		: new QuintEase(EasingMode.Out),
	"QuintInOut"	: new QuintEase(EasingMode.InOut),

	"SineIn"		: new SineEase(EasingMode.In),
	"SineOut"		: new SineEase(EasingMode.Out),
	"SineInOut"		: new SineEase(EasingMode.InOut)
};

export default Easing;
