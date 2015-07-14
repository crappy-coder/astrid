MoMatrixType = {
	"IsIdentity" : 0,
	"IsTranslation" : 1,
	"IsScaling" : 2,
	"IsUnknown" : 4
};

MoMatrixDecompositionType = {
	"Translation" : 0,
	"Rotation" : 1,
	"Scale" : 2,
	"Skew" : 4
};

MoMatrix2D = Class.create(MoEquatable, {
	initialize : function () {
		this.type = MoMatrixType.IsIdentity;
		this.m11 = 1;
		this.m12 = 0;
		this.m21 = 0;
		this.m22 = 1;
		this.offsetX = 0;
		this.offsetY = 0;
	},

	isEqualTo : function(obj) {
		if(this.type == MoMatrixType.IsIdentity || obj.type == MoMatrixType.IsIdentity)
			return (this.isIdentity() == obj.isIdentity());

		return (this.m11 == obj.m11 &&
				this.m12 == obj.m12 &&
				this.m21 == obj.m21 &&
				this.m22 == obj.m22 &&
				this.offsetX == obj.offsetX &&
				this.offsetY == obj.offsetY);
	},

	setMatrix : function(m11, m12, m21, m22, tx, ty) {
		this.m11 = m11;
		this.m12 = m12;
		this.m21 = m21;
		this.m22 = m22;
		this.offsetX = tx;
		this.offsetY = ty;
		this.determineMatrixType();
	},

	setIdentity : function() {
		this.setMatrix(1, 0, 0, 1, 0, 0);
	},

	isIdentity : function() {
		return (this.type == MoMatrixType.IsIdentity || (
			this.m11 == 1 &&
			this.m12 == 0 &&
			this.m21 == 0 &&
			this.m22 == 1 &&
			this.offsetX == 0 &&
			this.offsetY == 0
		));
	},

	determineMatrixType : function() {
		this.type = MoMatrixType.IsIdentity;
		
		if((this.m21 != 0) || (this.m12 != 0))
		{
			this.type = MoMatrixType.IsUnknown;
		}
		else
		{
			if((this.m11 != 1) || (this.m22 != 1))
				this.type = MoMatrixType.IsScaling;
			
			if((this.offsetX != 0) || (this.offsetY != 0))
				this.type |= MoMatrixType.IsTranslation;
			
			if((this.type & (MoMatrixType.IsScaling | MoMatrixType.IsTranslation)) == MoMatrixType.IsIdentity)
				this.type = MoMatrixType.IsIdentity;
		}
	},
	
	decompose : function(decompositionType) {
		switch(decompositionType)
		{
			case MoMatrixDecompositionType.Translation:
				return new MoVector2D(this.offsetX, this.offsetY);
			case MoMatrixDecompositionType.Scale:
				return new MoVector2D(
					Math.sqrt(this.m11 * this.m11 + this.m12 * this.m12),
					Math.sqrt(this.m21 * this.m21 + this.m22 * this.m22));
			case MoMatrixDecompositionType.Skew:
			case MoMatrixDecompositionType.Rotation:
			
				var skewX = Math.atan2(-this.m21, this.m22);
				var skewY = Math.atan2(this.m12, this.m11);
				
				if(skewX == skewY)
				{
					if(decompositionType == MoMatrixDecompositionType.Skew)
						return MoVector2D.Zero();
					else
					{
						var rotation = skewY / MoDegreeToRadian;
						
						if(this.m11 < 0 && this.m22 >= 0)
							rotation += (rotation <= 0) ? 180 : -180;
						
						return rotation;
					}
				}
				
				return new MoVector2D(
					skewX / MoDegreeToRadian,
					skewY / MoDegreeToRadian);
		}

		return null;
	},
	
	determinate : function() {
		switch(this.type)
		{
			case MoMatrixType.IsIdentity:
			case MoMatrixType.IsTranslation:
				return 1.0;
			case MoMatrixType.IsScaling:
			case (MoMatrixType.IsScaling | MoMatrixType.IsTranslation):
				return (this.m11 * this.m22);
		}
		
		return ((this.m11 * this.m22) - (this.m12 * this.m21));
	},

	invert : function() {
		var det = this.determinate();
		var mx = MoMatrix2D.createIdentity();
		
		// cannot invert
		if(det == 0)
			return;
		
		switch(this.type)
		{
			case MoMatrixType.IsIdentity:
				break;
			case MoMatrixType.IsTranslation:
				mx.offsetX = -this.offsetX;
				mx.offsetY = -this.offsetY;
				break;
			case MoMatrixType.IsScaling:
				mx.m11 = 1.0 / this.m11;
				mx.m22 = 1.0 / this.m22;
				break;
			case (MoMatrixType.IsScaling | MoMatrixType.IsTranslation):
				mx.m11 = 1.0 / this.m11;
				mx.m22 = 1.0 / this.m22;
				mx.offsetX = -this.offsetX * mx.m11;
				mx.offsetY = -this.offsetY * mx.m22;
				break;
		}
		
		var inv = 1.0 / det;
		mx.setMatrix(
				 this.m22 * inv,
				-this.m12 * inv,
				-this.m21 * inv,
				 this.m11 * inv,
				((this.m21 * this.offsetY) - (this.offsetX * this.m22)) * inv,
				((this.offsetX * this.m12) - (this.m11 * this.offsetY)) * inv);
				
		mx.type = MoMatrixType.IsUnknown;
		
		return mx;
	},
	
	validate : function() {
		this.m11 =		(isNaN(this.m11) ? 0 : this.m11);
		this.m12 =		(isNaN(this.m12) ? 0 : this.m12);
		this.m21 =		(isNaN(this.m21) ? 0 : this.m21);
		this.m22 =		(isNaN(this.m22) ? 0 : this.m22);
		this.offsetX =	(isNaN(this.offsetX) ? 0 : this.offsetX);
		this.offsetY =	(isNaN(this.offsetY) ? 0 : this.offsetY);
	},
	
	truncateToPrecision : function(precision) {
		this.m11 = MoMath.toPrecision(this.m11, precision);
		this.m12 = MoMath.toPrecision(this.m12, precision);
		this.m21 = MoMath.toPrecision(this.m21, precision);
		this.m22 = MoMath.toPrecision(this.m22, precision);
		this.offsetX = MoMath.toPrecision(this.offsetX, precision);
		this.offsetY = MoMath.toPrecision(this.offsetY, precision);
	},

	copyFrom : function(m) {
		this.type = m.type;
		this.m11 = m.m11;
		this.m12 = m.m12;
		this.m21 = m.m21;
		this.m22 = m.m22;
		this.offsetX = m.offsetX;
		this.offsetY = m.offsetY;
	},
	
	copy : function() {
		var m = new MoMatrix2D();
		m.copyFrom(this);

		return m;
	},

	rotate : function(angle, prepend) {
		this.rotateAt(angle, 0, 0, prepend);
	},

	rotateAt : function(angle, cx, cy, prepend) {
		var m = MoMatrix2D.createRotation((angle % 360) * MoDegreeToRadian, cx, cy);

		if(prepend)
			this.prepend(m);
		else
			this.append(m);
	},

	scale : function(sx, sy, prepend) {
		this.scaleAt(sx, sy, 0, 0, prepend);
	},

	scaleAt : function(sx, sy, cx, cy, prepend) {
		var m = MoMatrix2D.createScale(sx, sy, cx, cy);

		if(prepend)
			this.prepend(m);
		else
			this.append(m);
	},
	
	skew : function(sx, sy, prepend) {
		var m = MoMatrix2D.createSkew((sx % 360) * MoDegreeToRadian, (sy % 360) * MoDegreeToRadian);
		
		if(prepend)
			this.prepend(m);
		else
			this.append(m);
	},

	translate : function(tx, ty, prepend) {
		
		if(prepend)
		{
			var m = MoMatrix2D.createTranslation(tx, ty);
			this.prepend(m);
		}
		else
		{
			if(this.type == MoMatrixType.IsIdentity)
			{
				this.setMatrix(1, 0, 0, 1, tx, ty);
				this.type = MoMatrixType.IsTranslation;
			}
			else if(this.type == MoMatrixType.IsUnknown)
			{
				this.offsetX += tx;
				this.offsetY += ty;
			}
			else
			{
				this.offsetX += tx;
				this.offsetY += ty;
				this.type |= MoMatrixType.IsTranslation;
			}
		}
	},

	append : function(m) {
		var mx = this.multiply(this, m);
		this.copyFrom(mx);
	},

	prepend : function(m) {
		var mx = this.multiply(m, this);
		this.copyFrom(mx);
	},

	add : function(m1, m2) {
		var m = new MoMatrix2D();
		m.setMatrix(
			m1.m11 + m2.m11,
			m1.m12 + m2.m12,
			m1.m21 + m2.m21,
			m1.m22 + m2.m22,
			m1.offsetX + m2.offsetX,
			m1.offsetY + m2.offsetY
		);
		return m;
	},

	transformVector : function(v) {
		return this.transform(v, false);
	},

	transformPoint : function(pt) {
		return this.transform(pt, true);
	},
	
	transformPoints : function(points) {
		for(var i = 0; i < points.length; i++)
			points[i] = this.transformPoint(points[i]);
	},

	transform : function(xy, isPoint) {
		if(isPoint)
		{
			return this.multiplyPoint(xy.x, xy.y);
		}
		else
		{
			var nx = xy.x;
			var ny = xy.y;

			switch(this.type)
			{
				case MoMatrixType.IsIdentity:
				case MoMatrixType.IsTranslation:
					return new MoVector2D(nx, ny);
				case MoMatrixType.IsScaling:
				case (MoMatrixType.IsScaling | MoMatrixType.IsTranslation):
					nx *= this.m11;
					ny *= this.m22;

					return new MoVector2D(nx, ny);
			}

			var tx = (nx * this.m21);
			var ty = (ny * this.m12);

			nx *= this.m11;
			nx += tx;
			ny *= this.m22;
			ny += ty;

			return new MoVector2D(nx, ny);
		}
	},
	
	transformRect : function(rect) {
		var newRect = rect.copy();
		
		if(!newRect.isEmpty())
		{
			if(this.type != MoMatrixType.IsIdentity)
			{
				if((this.type & MoMatrixType.IsScaling) != MoMatrixType.IsIdentity)
				{
					newRect.x *= this.m11;
					newRect.y *= this.m22;
					newRect.width *= this.m11;
					newRect.height *= this.m22;
					
					if(newRect.width < 0)
					{
						newRect.x += newRect.width;
						newRect.width = -newRect.width;
					}
					
					if(newRect.height < 0)
					{
						newRect.y += newRect.height;
						newRect.height = -newRect.height;
					}
				}
				
				if((this.type & MoMatrixType.IsTranslation) != MoMatrixType.IsIdentity)
				{
					newRect.x += this.offsetX;
					newRect.y += this.offsetY;
				}
				
				if(this.type == MoMatrixType.IsUnknown)
				{
					var p1 = this.transformPoint(newRect.topLeft());
					var p2 = this.transformPoint(newRect.topRight());
					var p3 = this.transformPoint(newRect.bottomRight());
					var p4 = this.transformPoint(newRect.bottomLeft());
					
					newRect.x = Math.min(Math.min(p1.x, p2.x), Math.min(p3.x, p4.x));
					newRect.y = Math.min(Math.min(p1.y, p2.y), Math.min(p3.y, p4.y));
					
					newRect.width = Math.max(Math.max(p1.x, p2.x), Math.max(p3.x, p4.x)) - newRect.x;
					newRect.height = Math.max(Math.max(p1.y, p2.y), Math.max(p3.y, p4.y)) - newRect.y;
				}
			}
		}

		return newRect;
	},

	multiply : function(m1, m2) {
		var typeA = m1.type;
		var typeB = m2.type;

		if(typeB != MoMatrixType.IsIdentity)
		{
			if(typeA == MoMatrixType.IsIdentity)
			{
				var m = new MoMatrix2D();
				m.setMatrix(m2.m11, m2.m12, m2.m21, m2.m22, m2.offsetX, m2.offsetY);
				return m;
			}

			if(typeB == MoMatrixType.IsTranslation)
			{
				var m = new MoMatrix2D();
				m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);

				m.offsetX += m2.offsetX;
				m.offsetY += m2.offsetY;
				
				if(typeA != MoMatrixType.IsUnknown)
					m.type |= MoMatrixType.IsTranslation;

				return m;
			}
			
			if(typeA == MoMatrixType.IsTranslation)
			{
				var m = new MoMatrix2D();
				m.setMatrix(m2.m11, m2.m12, m2.m21, m2.m22, m2.offsetX, m2.offsetY);
						
				m.offsetX = ((m1.offsetX * m2.m11) + (m1.offsetY * m2.m21)) + m2.offsetX;
				m.offsetY = ((m1.offsetX * m2.m12) + (m1.offsetY * m2.m22)) + m2.offsetY;
				
				if(typeB == MoMatrixType.IsUnknown)
					m.type = MoMatrixType.IsUnknown;
				else
					m.type = MoMatrixType.IsScaling | MoMatrixType.IsTranslation;
				
				return m;
			}
			
			var m = new MoMatrix2D();
			m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);

			switch((typeA << 4) | typeB)
			{
				case 34:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					return m;
				case 35:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX = m2.offsetX;
					m.offsetY = m2.offsetY;
					m.type = MoMatrixType.IsScaling | MoMatrixType.IsTranslation;
					return m;
				case 36:
				case 52:
				case 66:
				case 67:
				case 68:
					m.setMatrix(
						(m1.m11 * m2.m11) + // M11
						(m1.m12 * m2.m21),  //
						
						(m1.m11 * m2.m12) + // M12
						(m1.m12 * m2.m22),  //
						
						(m1.m21 * m2.m11) + // M21
						(m1.m22 * m2.m21),  //
						
						(m1.m21 * m2.m12) + // M22
						(m1.m22 * m2.m22),  //
						
						((m1.offsetX * m2.m11) +				// OffsetX
						(m1.offsetY * m2.m21)) + m2.offsetX,	//
						
						((m1.offsetX * m2.m12) +				// OffsetY
						(m1.offsetY * m2.m22)) + m2.offsetY); //
					return m;
				case 50:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX *= m2.m11;
					m.offsetY *= m2.m22;
					return m;
				case 51:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX = (m2.m11 * m.offsetX) + m2.offsetX;
					m.offsetY = (m2.m22 * m.offsetY) + m2.offsetY;
					return m;
			}
		}
		
		var m = new MoMatrix2D();
		m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);
		return m;
	},

	multiplyPoint : function(x, y) {
		var nx = x;
		var ny = y;

		switch(this.type)
		{
			case MoMatrixType.IsIdentity:
				return new MoVector2D(nx, ny);
			case MoMatrixType.IsTranslation:
				nx += this.offsetX;
				ny += this.offsetY;

				return new MoVector2D(nx, ny);
			case MoMatrixType.IsScaling:
				nx *= this.m11;
				ny *= this.m22;

				return new MoVector2D(nx, ny);
			case (MoMatrixType.IsScaling | MoMatrixType.IsTranslation):
				nx *= this.m11;
				nx += this.offsetX;
				ny *= this.m22;
				ny += this.offsetY;

				return new MoVector2D(nx, ny);
		}

		var tx = (ny * this.m21) + this.offsetX;
		var ty = (nx * this.m12) + this.offsetY;

		nx *= this.m11;
		nx += tx;
		ny *= this.m22;
		ny += ty;

		return new MoVector2D(nx, ny);
	},

	toString : function() {
		return  "m11=" + this.m11 + ", " +
				"m12=" + this.m12 + ", " +
				"m21=" + this.m21 + ", " +
				"m22=" + this.m22 + ", " +
				"tx=" + this.offsetX + ", " +
				"ty=" + this.offsetY + ", ";
	}
});

Object.extend(MoMatrix2D, {

	createIdentity : function() {
		return new MoMatrix2D();
	},

	createTranslation : function(tx, ty) {
		var m = new MoMatrix2D();
		m.offsetX = tx;
		m.offsetY = ty;
		m.type = MoMatrixType.IsTranslation;

		return m;
	},

	createRotation : function(angle, cx, cy) {
		
		cx = MoValueOrDefault(cx, 0);
		cy = MoValueOrDefault(cy, 0);

		var m = new MoMatrix2D();
		var cr = Math.cos(angle);
		var sr = Math.sin(angle);
		var tx = (cx * (1.0 - cr)) + (cy * sr);
		var ty = (cy * (1.0 - cr)) - (cx * sr);

		m.m11 = cr;
		m.m12 = sr;
		m.m21 = -sr;
		m.m22 = cr;
		m.offsetX = tx;
		m.offsetY = ty;
		m.type = MoMatrixType.IsUnknown;

		return m;
	},

	createScale : function(sx, sy, cx, cy) {
		var m = new MoMatrix2D();
		
		m.type = MoMatrixType.IsScaling;
		m.m11 = sx;
		m.m12 = 0;
		m.m21 = 0;
		m.m22 = sy;
		m.offsetX = 0;
		m.offsetY = 0;
		
		cx = MoValueOrDefault(cx, 0);
		cy = MoValueOrDefault(cy, 0);

		m.type |= MoMatrixType.IsTranslation;
		m.offsetX = (cx - (sx * cx));
		m.offsetY = (cy - (sy * cy));

		return m;
	},
	
	createSkew : function(sx, sy) {
		var m = new MoMatrix2D();
		
		m.type = MoMatrixType.IsUnknown;
		m.m11 = 1;
		m.m12 = Math.tan(sy);
		m.m21 = Math.tan(sx);
		m.m22 = 1;
		m.offsetX = 0;
		m.offsetY = 0;

		return m;
	}
});
