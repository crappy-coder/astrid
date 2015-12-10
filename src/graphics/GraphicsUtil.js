import DefaultGraphics from "./default/DefaultGraphics"
import WebGLGraphics from "./webgl/WebGLGraphics"
import Application from "../Application"
import RenderMode from "../RenderMode"
import System from "../System"


/**
 * SUMMARY:
 *  Utility class for helping out with various graphics associated tasks.
 *
 */
const GraphicsUtil = {
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


