// FIXME : implement full url class

MoUrl = Class.create({
	initialize : function(url) {
		this.rawUrl = url;
	}
});

Object.extend(MoUrl, {
	combine : function(url) {
		var arr = [url];
		var fullUrl = "";
		
		if(arguments.length > 1)
		{
			for(var i = 1; i < arguments.length; ++i)
			{
				if(!MoStringIsNullOrEmpty(arguments[i]))
					arr.push(arguments[i]);
			}
		}
		
		for(var i = 0; i < arr.length; ++i)
		{
			var value = arr[i];
			
			fullUrl += value.replace("\\", "/");
			
			if(value.charAt(value.length-1) != "/" && (i+1) < arr.length)
				fullUrl += "/";
		}

		return fullUrl;
	}
});