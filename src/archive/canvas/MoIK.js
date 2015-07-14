MoIK = Class.create({
	initialize : function(name, x, y) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.lastBone = null;
		this.bones = [];
		this.draw = null;
	},
	
	getName : function() {
		return this.name;
	},
	
	getRoot : function() {
		if(this.bones.length == 0)
			return null;
		
		return this.bones[0];
	},

	add : function(bone) {
		if(MoIsNull(bone))
			return;

		if(this.lastBone != null)
		{
			bone.prevBone = this.lastBone;
			this.lastBone.nextBone = bone;
		}

		this.bones.push(bone);
		this.lastBone = bone;
	},
	
	remove : function(bone) {
		return this.removeAt(this.bones.indexOf(bone));
	},
	
	removeAt : function(idx) {
		if(idx >= 0 && idx <= this.bones.length)
		{
			var list = this.bones.splice(idx);
			var last = null;
			
			for(var i = 0; i < this.bones.length; ++i)
			{
				if(last != null)
					last.nextBone = this.bones[i];

				this.bones[i].prevBone = last;
				last = this.bones[i];
			}
			
			return list;
		}
		
		return null;
	},
	
	clear : function() {
		this.bones.length = 0;
	},
	
	get : function(name) {
		var len = this.getCount();
		
		for(var i = 0; i < len; ++i)
		{
			if(this.bones[i].getName() == name)
				return this.bones[i];
		}
		
		return null;
	},
	
	getCount : function() {
		return this.bones.length;
	},
	
	getAt : function(idx) {
		return this.bones[idx];
	},
	
	rotate : function(angle) {
		var root = this.getRoot();
		
		if(!MoIsNull(root))
			root.setAngle(angle);
	},
	
	update : function() {
		var len = this.bones.length;
		var drawable = null;
		var angle = 0;
		var px = this.x;
		var py = this.y;

		for(var i = 0; i < len; ++i)
		{
			drawable = this.bones[i].drawable;
			angle += MoMath.degreesToRadians(this.bones[i].getAngle());
			
			if(drawable != null)
			{
				var xform = drawable.getRenderTransform();
				var offset = (MoIsNull(this.bones[i].drawablePosition) ? drawable.getCenter() : this.bones[i].drawablePosition);

				if(xform == null)
				{
					xform = new MoRotateTransform();
					drawable.setRenderTransform(xform);
				}
				
				drawable.setX(px - offset.x);
				drawable.setY(py - offset.y);

				xform.setAngle(MoMath.radiansToDegrees(angle));
				xform.setCenterX(offset.x);
				xform.setCenterY(offset.y);
			}

			px += Math.cos(angle) * this.bones[i].getLength();
			py += Math.sin(angle) * this.bones[i].getLength();
		}

		if(this.draw)
		{
			this.draw.requestLayout();
			this.draw.requestMeasure();
		}
	},

	moveTo : function(targetX, targetY) {
		var len = this.bones.length;
		var bones = [];
		var worldBones = [];
		var prevBone = null;
		var currBone = null;
		
		for(var i = 0; i <= len; ++i)
		{
			bones.push(new MoIKBoneImpl(
				(i > 0 ? this.bones[i-1].getLength() : 0), 0,
				(i < len ? MoMath.degreesToRadians(this.bones[i].getAngle()) : 0)
			));
		}

		len = bones.length;

		worldBones.push(new MoIKBoneImpl(bones[0].x, bones[0].y, bones[0].angle));
		
		for(var i = 1; i < len; ++i)
		{
			prevBone = worldBones[i-1];
			currBone = bones[i];
		
			worldBones.push(new MoIKBoneImpl(
				prevBone.x + Math.cos(prevBone.angle) * currBone.x - Math.sin(prevBone.angle) * currBone.y,
				prevBone.y + Math.sin(prevBone.angle) * currBone.x + Math.cos(prevBone.angle) * currBone.y,
				prevBone.angle + currBone.angle
			));
		}

		var endX = worldBones[len-1].x;
		var endY = worldBones[len-1].y;
		var modified = false;
		var success = false;
		var epsilon = 0.0001;
		var arcLength = 0.00001;
		
		for(var i = len-1; i >= 0; --i)
		{
			var curToEndX = endX - worldBones[i].x;
			var curToEndY = endY - worldBones[i].y;
			var curToEndMag = Math.sqrt(curToEndX*curToEndX + curToEndY*curToEndY);
			
			var curToTargetX = targetX - worldBones[i].x;
			var curToTargetY = targetY - worldBones[i].y;
			var curToTargetMag = Math.sqrt(curToTargetX*curToTargetX + curToTargetY*curToTargetY);
			
			var rotAngleC = 0;
			var rotAngleS = 0;
			var endTargetMag = (curToEndMag * curToTargetMag);
			
			if(endTargetMag <= epsilon)
			{
				rotAngleC = 1;
				rotAngleS = 0;
			}
			else
			{
				rotAngleC = (curToEndX*curToTargetX + curToEndY*curToTargetY) / endTargetMag;
				rotAngleS = (curToEndX*curToTargetY - curToEndY*curToTargetX) / endTargetMag;
			}
			
			var rotAngle = Math.acos(Math.max(-1, Math.min(1, rotAngleC)));
			
			if(rotAngleS < 0.0)
				rotAngle = -rotAngle;
				
			endX = worldBones[i].x + rotAngleC*curToEndX - rotAngleS*curToEndY;
			endY = worldBones[i].y + rotAngleS*curToEndX + rotAngleC*curToEndY;

			bones[i].angle = this.simplifyAngle(bones[i].angle + rotAngle);
			
			var endToTargetX = (targetX - endX);
			var endToTargetY = (targetY - endY);
			
			if(endToTargetX*endToTargetX + endToTargetY*endToTargetY <= 2)
			{
				success = true;
				break;
			}
			
			if(!modified && Math.abs(rotAngle)*curToEndMag > arcLength)
				modified = true;
		}

		for(var i = 0; i < this.bones.length; ++i)
			this.bones[i].setAngle(MoMath.radiansToDegrees(bones[i].angle));
	},

	simplifyAngle : function(angle) {
		angle = angle % (2.0 * Math.PI);

		if(angle < -Math.PI)
			angle += (2.0 * Math.PI);
		else if(angle > Math.PI)
			angle -= (2.0 * Math.PI);

		return angle;
	}
});	

MoIKBone = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super, name, length, angle, drawable) {
		$super();
		
		this.initializeAnimatableProperties();
		
		this.name = name;
		this.setLength(length);
		this.setAngle(angle);

		this.prevBone = null;
		this.nextBone = null;
		this.drawable = MoValueOrDefault(drawable, null);
		this.drawablePosition = null;
	},
	
	initializeAnimatablePropertiesCore : function() {		
		this.enableAnimatableProperty("length", this.getLength, this.setLength, MoPropertyOptions.None);
		this.enableAnimatableProperty("angle", this.getAngle, this.setAngle, MoPropertyOptions.None);
	},
	
	getName : function() {
		return this.name;
	},
	
	setName : function(value) {
		this.name = value;
	},
	
	getDrawable : function() {
		return this.drawable;
	},

	getDrawablePosition : function() {
		return this.drawablePosition;
	},

	setDrawablePosition : function(value) {
		if(value == null)
			this.drawablePosition = null;
		else
		{
			if(this.drawablePosition == null)
				this.drawablePosition = new MoVector2D();
			
			this.drawablePosition.x = value.x;
			this.drawablePosition.y = value.y;
		}
	},

	setDrawable : function(value) {
		this.drawable = value;
	},

	getAngle : function() {
		return this.getPropertyValue("angle");
	},
	
	setAngle : function(value) {			
		this.setPropertyValue("angle", value);
	},

	getLength : function() {
		return this.getPropertyValue("length");
	},
	
	setLength : function(value) {
		this.setPropertyValue("length", value);
	},
	
	getPrevBone : function() {
		return this.prevBone;
	},

	getNextBone : function() {
		return this.nextBone;
	}
});

MoIKBoneImpl = Class.create({
	initialize : function(x, y, angle) {
		this.x = x;
		this.y = y;
		this.angle = angle;
	}
});

MoIKContainer = Class.create(MoCanvas, {
	initialize : function($super, name, surface) {
		$super(name);
		
		surface = MoValueOrDefault(surface, MoApplication.getInstance().getDisplaySurfaceAt(0));
			
		this.ik = surface.createArmature(name, 0, 0);
	},
	
	getIK : function() {
		return this.ik;
	},
	
	attach : function(bone) {
		this.ik.add(bone);
	},
	
	getBone : function(name) {
		return this.ik.get(name);
	},
	
	getBoneAt : function(idx) {
		return this.ik.getAt(idx);
	},
	
	getBoneCount : function() {
		return this.ik.getCount();
	},

	addBone : function(length, angle, drawable, anchorPoint) {
		anchorPoint = MoValueOrDefault(anchorPoint, new MoVector2D(0, drawable.getHeight() * 0.5));

		var bone = new MoIKBone(drawable.getName(), length, angle, drawable);
		bone.setDrawablePosition(anchorPoint);

		this.ik.add(bone);
		this.add(drawable);
		
		return bone;
	}
});

MoIKDraw = Class.create(MoCanvas, {
	initialize : function($super, ik) {
		$super("ikdraw");
		
		this.ik = ik;
		this.ik.draw = this;
	},
	
 	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var gfx = this.getGraphics();
		var bones = this.ik.bones;
		var len = bones.length;
		var angle = 0;
		var px = 0;
		var py = 0;
		var lx = 0;
		var ly = 0;

		gfx.beginPath();
		gfx.moveTo(0, 0);

		for(var i = 0; i < len; ++i)
		{
			angle += MoMath.degreesToRadians(bones[i].getAngle());
			
			px += Math.cos(angle) * bones[i].getLength();
			py += Math.sin(angle) * bones[i].getLength();
			
			gfx.lineTo(px, py);
		}
		
		gfx.stroke(new MoPen(MoSolidColorBrush.red(), 2));
	}
});