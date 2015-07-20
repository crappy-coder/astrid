/**
 * SUMMARY:
 *  Utility class for helping out with various graphics associated tasks.
 *
 */
var GraphicsUtil = {
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
	}
};

export default GraphicsUtil;


