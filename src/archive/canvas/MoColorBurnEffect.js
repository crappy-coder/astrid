MoColorBurnEffect = Class.create(MoEffect, {
	initialize : function($super) {
		$super();

	},

	processCore : function(target, pixelData) {
		var globalBounds = target.getGlobalBounds();
		var dstData = MoGraphicsUtil.getImageData(target.getScene().getNativeGraphicsContext(), globalBounds.x, globalBounds.y, pixelData.width, pixelData.height, true);
		var src = pixelData.data;
		var dst = dstData.data;
		var len = src.length;
		var alpha = 1;

		for(var i = 0; i < len; i += 4)
		{
			var sr = src[i + 0];
			var sg = src[i + 1];
			var sb = src[i + 2];
			var sa = src[i + 3];
			var dr = dst[i + 0];
			var dg = dst[i + 1];
			var db = dst[i + 2];
			var da = dst[i + 3];
			var dor, dog, dob;
			
			if(sr != 0)
				dor = Math.max(255 - (((255 - dr) << 8) / sr), 0);
			else
				dor = sr;
			
			if(sg != 0)
				dog = Math.max(255 - (((255 - dg) << 8) / sg), 0);
			else
				dog = sg;
			
			if(sb != 0)
				dob =  Math.max(255 - (((255 - db) << 8) / sb), 0);
			else
				dob = sb;
			
			var a = alpha * sa / 255;
			var ac = 1-a;
			
			
			dst[i + 0] = (a * dor + ac * dr);
			dst[i + 1] = (a * dog + ac * dg);
			dst[i + 2] = (a * dob + ac * db);
			dst[i + 3] = (sa * alpha + da * ac);
		}
		
		return dstData;
	}
});
	