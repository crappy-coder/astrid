// FIXME : implement full url class

class Url {
	constructor(url) {
		this.rawUrl = url;
	}

	static combine(url) {
		var arr = [url];
		var fullUrl = "";
		var i;

		if (arguments.length > 1) {
			for (i = 1; i < arguments.length; ++i) {
				if (arguments[i]) {
					arr.push(arguments[i]);
				}
			}
		}

		for (i = 0; i < arr.length; ++i) {
			var value = arr[i];

			fullUrl += value.replace("\\", "/");

			if (value.charAt(value.length - 1) != "/" && (i + 1) < arr.length) {
				fullUrl += "/";
			}
		}

		return fullUrl;
	}
}

export default Url;
