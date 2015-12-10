import Dictionary from "../Dictionary"

class TextureCache {
	static add(path, data) {
		TextureCache.ensureCache();
		TextureCache.Textures.set(path, data);
	}

	static remove(path) {
		TextureCache.ensureCache();
		TextureCache.Textures.remove(path);
	}

	static get(path) {
		TextureCache.ensureCache();
		return TextureCache.Textures.get(path);
	}

	static clear() {
		if(TextureCache.Textures) {
			TextureCache.Textures.clear();
		}
	}

	static ensureCache() {
		if(!TextureCache.Textures) {
			TextureCache.Textures = new Dictionary();
        }
	}
}

TextureCache.Textures = null;

export default TextureCache;
