import Equatable from "./Equatable";
import Dictionary from "./Dictionary";

var CachedTextures = null;

export function EnsureTextureCache() {
	if (CachedTextures == null) {
		CachedTextures = new Dictionary();
	}
}

export function TextureCacheAdd(path, data) {
	EnsureTextureCache();
	CachedTextures.set(path, data);
}

export function TextureCacheRemove(path) {
	EnsureTextureCache();
	CachedTextures.remove(path);
}

export function TextureCacheGet(path) {
	EnsureTextureCache();
	return CachedTextures.get(path);
}

export function TextureCacheClear() {
	EnsureTextureCache();
	CachedTextures.clear();
}


export function ValueOrDefault(value, defaultValue) {
	return ((value == null) ? defaultValue : value);
}

export function StringContains(str, value) {
	return (str.indexOf(value) != -1);
}

export function IsNull(value) {
	return (value == undefined || value == null);
}

export function StringIsNullOrEmpty(value) {
	if(IsNull(value))
		return true;

	return (value.length == 0);
}

export function AreEqual(a, b) {
	if (a != null && b != null) {
		if ((a instanceof Equatable) && (b instanceof Equatable)) {
			if (a.constructor === b.constructor) {
				return a.isEqualTo(b);
			}
		}
		else if ((a instanceof Array) && (b instanceof Array)) {
			if (a.length != b.length) {
				return false;
			}

			var arrLen = a.length;
			var arrItemA = null;
			var arrItemB = null;

			for (var i = 0; i < arrLen; ++i) {
				arrItemA = a[i];
				arrItemB = b[i];

				if (AreNotEqual(arrItemA, arrItemB)) {
					return false;
				}
			}

			return true;
		}
	}

	return (a == b);
}

export function AreNotEqual(a, b) {
	return !AreEqual(a, b);
}

export function Mixin(Parent, mixin) {
	class Mixed extends Parent {}
	Object.assign(Mixed.prototype, mixin);
	return Mixed;
}
