class TextureCoords {
	constructor() {
		this.coords = [
			0, 0,	// TL
			1, 0,	// TR
			1, 1,	// BR
			0, 1	// BL
		];
	}

	get x1() {
		return this.coords[0];
	}

	set x1(value) {
		this.coords[0] = value || 0;
	}

	get y1() {
		return this.coords[1];
	}

	set y1(value) {
		this.coords[1] = value || 0;
	}

	get x2() {
		return this.coords[2];
	}

	set x2(value) {
		this.coords[2] = value || 0;
	}

	get y2() {
		return this.coords[3];
	}

	set y2(value) {
		this.coords[3] = value || 0;
	}

	get x3() {
		return this.coords[4];
	}

	set x3(value) {
		this.coords[4] = value || 0;
	}

	get y3() {
		return this.coords[5];
	}

	set y3(value) {
		this.coords[5] = value || 0;
	}

	get x4() {
		return this.coords[6];
	}

	set x4(value) {
		this.coords[6] = value || 0;
	}

	get y4() {
		return this.coords[7];
	}

	set y4(value) {
		this.coords[7] = value || 0;
	}

	static FromRect(rect, refRect) {
		var mw = refRect ? refRect.width : rect.width;
		var mh = refRect ? refRect.height : rect.height;
		var texcoords = new TextureCoords();

		texcoords.x1 = rect.x / mw;
		texcoords.y1 = rect.y / mh;
		texcoords.x2 = rect.right() / mw;
		texcoords.y2 = rect.y / mh;
		texcoords.x3 = rect.right() / mw;
		texcoords.y3 = rect.bottom() / mh;
		texcoords.x4 = rect.x / mw;
		texcoords.y4 = rect.bottom() / mh;

		return texcoords;
	}
}

export default TextureCoords;