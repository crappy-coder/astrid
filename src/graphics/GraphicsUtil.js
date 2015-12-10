import Application from "../Application"
import RenderMode from "../RenderMode"
import System from "../System"
import DefaultGraphics from "./default/DefaultGraphics"
import WebGLGraphics from "./webgl/WebGLGraphics"
import CompositeOperator from "./CompositeOperator"
import PenLineCap from "../ui/PenLineCap"
import PenLineJoin from "../ui/PenLineJoin"


/**
 * SUMMARY:
 *  Utility class for helping out with various graphics associated tasks.
 *
 */
const GraphicsUtil = {
	toLineCapString: function(lineCap) {
		switch (lineCap) {
			case PenLineCap.Round:
				return "round";
			case PenLineCap.Square:
				return "square";
		}

		return "butt";
	},

	toLineJoinString: function(lineJoin) {
		switch (lineJoin) {
			case PenLineJoin.Bevel:
				return "bevel";
			case PenLineJoin.Round:
				return "round";
		}

		return "miter";
	},

	toCompositeOperatorString: function(compositeOp) {
		switch (compositeOp) {
			case CompositeOperator.Clear:
				return "clear";
			case CompositeOperator.SourceIn:
				return "source-in";
			case CompositeOperator.SourceOut:
				return "source-out";
			case CompositeOperator.SourceATop:
				return "source-atop";
			case CompositeOperator.DestinationOver:
				return "destination-over";
			case CompositeOperator.DestinationIn:
				return "destination-in";
			case CompositeOperator.DestinationOut:
				return "destination-out";
			case CompositeOperator.DestinationATop:
				return "destination-atop";
			case CompositeOperator.XOr:
				return "xor";
			case CompositeOperator.Copy:
				return "copy";
		}

		return "source-over";
	},

	getImageData: function (context, x, y, width, height, requestPermission) {
		try {
			return context.getImageData(x, y, width, height);
		}
		catch (e) {
			if (!requestPermission) {
				return null;
			}

			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

			try {
				return context.getImageData(x, y, width, height);
			}
			catch (e) {
			}
		}

		return null;
	},

	createGraphics: function(drawable) {
		var app = Application.getInstance();
		var mode = app.renderMode;

		// figure out which mode to use
		if (mode === RenderMode.AUTO) {
			mode = (System.hasWebGL ? RenderMode.HARDWARE : RenderMode.SOFTWARE);
		}

		switch(mode) {
			case RenderMode.SOFTWARE:
				return new DefaultGraphics(drawable);
			case RenderMode.HARDWARE:
				return new WebGLGraphics(drawable);
		}
	}
};

export default GraphicsUtil;


