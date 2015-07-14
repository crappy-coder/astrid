MoNoise = Class.create({
	initialize : function() {
		this.d = [];
		
		for(var i = 0; i < MoNoise.Size + 1; i++)
			this.d[i] = Math.random();
		
		this.cosT = MoNoise.CosLut;
		this.twoPi = this.pi = MoNoise.Length;
		this.pi >>= 1;
	},
	
	generate : function(x, y, z) {
		if(MoIsNull(z))
			z = 0;
			
		if (x < 0) 
			x = -x;
			
		if (y < 0) 
			y = -y;
			
		if (z < 0) 
			z = -z;
			
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
		
		for (var i = 0; i < MoNoise.Octaves; i++) 
		{
			var of = xi + (yi << MoNoise.YWrapB) + (zi << MoNoise.ZWrapB);
			
			rxf = this.fsc(xf);
			ryf = this.fsc(yf);
			
			n1 = this.d[of & MoNoise.Size];
			n1 += rxf * (this.d[(of + 1) & MoNoise.Size] - n1);
			
			n2 = this.d[(of + MoNoise.YWrap) & MoNoise.Size];
			n2 += rxf * (this.d[(of + MoNoise.YWrap + 1) & MoNoise.Size] - n2);
			
			n1 += ryf * (n2 - n1);
			
			of += MoNoise.ZWrap;
			
			n2 = this.d[of & MoNoise.Size];
			n2 += rxf * (this.d[(of + 1) & MoNoise.Size] - n2);
			
			n3 = this.d[(of + MoNoise.YWrap) & MoNoise.Size];
			n3 += rxf * (this.d[(of + MoNoise.YWrap + 1) & MoNoise.Size] - n3);
			
			n2 += ryf * (n3 - n2);
			
			n1 += this.fsc(zf) * (n2 - n1);
			
			r += n1 * ampl;
			ampl *= MoNoise.Falloff;

			xi <<= 1;
			xf *= 2;

			yi <<= 1;
			yf *= 2;

			zi <<= 1;
			zf *= 2;

			if (xf >= 1.0) 
			{
				xi++;
				xf--;
			}

			if (yf >= 1.0) 
			{
				yi++;
				yf--;
			}
			
			if (zf >= 1.0) 
			{
				zi++;
				zf--;
			}
		}
		
		return r;
	},
	
	fsc : function(i) {
		return 0.5 * (1.0 - this.cosT[Math.round(i * this.pi) % this.twoPi]);
	}
});

Object.extend(MoNoise, {
	Instance : null,
	SinLut : [],
	CosLut : [],
	Precision : 0.5,
	Length : 0,
	YWrapB : 4,
	YWrap : 1 << MoNoise.YWrapB,
	ZWrapB : 8,
	ZWrap : 1 << MoNoise.ZWrapB,
	Size : 4095,
	Octaves : 4,
	Falloff : 0.5,
	
	perlin : function(x, y, z) {
		
		// initialize
		if(MoNoise.Instance == null)
		{
			MoNoise.Length = Math.round(360 / MoNoise.Precision);
			
			for(var i = 0; i < MoNoise.Length; i++)
			{
				MoNoise.SinLut[i] = Math.sin(i * (Math.PI / 180.0) * MoNoise.Precision);
				MoNoise.CosLut[i] = Math.cos(i * (Math.PI / 180.0) * MoNoise.Precision);
			}
			
			MoNoise.Instance = new MoNoise();
		}
		
		return MoNoise.Instance.generate(x, y, z);
	}
});
