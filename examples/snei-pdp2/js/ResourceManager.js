import Fonts from "./Fonts"

class ResourceManager {
	static getString(id) {
		return "NOT IMPLEMENTED";
	}

	static getFont(name) {
		if(Fonts[name])
			return Fonts[name];

		return Fonts.Normal;
	}
}

export default ResourceManager;