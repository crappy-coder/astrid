var MoGraphicsUtil = {};

Object.extend(MoGraphicsUtil, {
	getImageData : function(context, x, y, width, height, requestPermission) {
		try
		{
			return context.getImageData(x, y, width, height);
		}
		catch(e)
		{
			if(!requestPermission)
				return null;

			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

			try
			{
				return context.getImageData(x, y, width, height);
			}
			catch(e) { }
		}
		
		return null;
	}
});