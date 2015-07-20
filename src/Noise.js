class Noise {
	constructor() {
		this.d = [];

		for (var i = 0; i < Noise.Size + 1; i++) {
			this.d[i] = Math.random();
		}

		this.cosT = Noise.CosLut;
		this.twoPi = this.pi = Noise.Length;
		this.pi >>= 1;
	}

	generate(x, y, z) {
		if (z == null) {
			z = 0;
		}

		if (x < 0) {
			x = -x;
		}

		if (y < 0) {
			y = -y;
		}

		if (z < 0) {
			z = -z;
		}

		var xi = x;
		var yi = y;
		var zi = z;
		var xf = x - xi;
		var yf = y - yi;
		var zf = z - zi;
		var rxf;
		var ryf;
		var r = 0;
		var ampl = 0.5;
		var n1;
		var n2;
		var n3;

		for (var i = 0; i < Noise.Octaves; i++) {
			var of = xi + (yi << Noise.YWrapB) + (zi << Noise.ZWrapB);

			rxf = this.fsc(xf);
			ryf = this.fsc(yf);

			n1 = this.d[of & Noise.Size];
			n1 += rxf * (this.d[(of + 1) & Noise.Size] - n1);

			n2 = this.d[(of + Noise.YWrap) & Noise.Size];
			n2 += rxf * (this.d[(of + Noise.YWrap + 1) & Noise.Size] - n2);

			n1 += ryf * (n2 - n1);

			of += Noise.ZWrap;

			n2 = this.d[of & Noise.Size];
			n2 += rxf * (this.d[(of + 1) & Noise.Size] - n2);

			n3 = this.d[(of + Noise.YWrap) & Noise.Size];
			n3 += rxf * (this.d[(of + Noise.YWrap + 1) & Noise.Size] - n3);

			n2 += ryf * (n3 - n2);

			n1 += this.fsc(zf) * (n2 - n1);

			r += n1 * ampl;
			ampl *= Noise.Falloff;

			xi <<= 1;
			xf *= 2;

			yi <<= 1;
			yf *= 2;

			zi <<= 1;
			zf *= 2;

			if (xf >= 1.0) {
				xi++;
				xf--;
			}

			if (yf >= 1.0) {
				yi++;
				yf--;
			}

			if (zf >= 1.0) {
				zi++;
				zf--;
			}
		}

		return r;
	}

	fsc(i) {
		return 0.5 * (1.0 - this.cosT[Math.round(i * this.pi) % this.twoPi]);
	}

	static perlin(x, y, z) {

		// initialize
		if (Noise.Instance == null) {
			Noise.Length = Math.round(360 / Noise.Precision);

			for (var i = 0; i < Noise.Length; i++) {
				Noise.SinLut[i] = Math.sin(i * (Math.PI / 180.0) * Noise.Precision);
				Noise.CosLut[i] = Math.cos(i * (Math.PI / 180.0) * Noise.Precision);
			}

			Noise.Instance = new Noise();
		}

		return Noise.Instance.generate(x, y, z);
	}
}

Object.assign(Noise, {
	Instance: null,
	SinLut: [],
	CosLut: [],
	Precision: 0.5,
	Length: 0,
	YWrapB: 4,
	YWrap: 1 << Noise.YWrapB,
	ZWrapB: 8,
	ZWrap: 1 << Noise.ZWrapB,
	Size: 4095,
	Octaves: 4,
	Falloff: 0.5
});

export default Noise;
