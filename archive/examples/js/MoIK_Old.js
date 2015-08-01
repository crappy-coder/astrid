var g_app = MoApplication.create();
var g_mx = 0;
var g_my = 0;

g_app.setEnableStatsGraph(true);
g_app.setEnableDebugVisuals(false);
g_app.addEventHandler(MoEvent.APPLICATION_START, handleApplicationStart.asDelegate(this));

function handleApplicationStart(e) {
	var surface = g_app.getDisplaySurfaceAt(0);
	var content = new MoCanvas("mainContent");
	
	content.setPercentWidth(100);
	content.setPercentHeight(100);
	content.setBackground(MoSolidColorBrush.fromColorHex("#333333"));

	surface.setChild(content);	
	surface.focus();
	
	surface.addEventHandler(MoMouseEvent.MOUSE_MOVE, function(e) {
		var viewportCenter = content.getCenter();
		
		g_mx = e.getX() - viewportCenter.x;
		g_my = -e.getY() + viewportCenter.y;
	});
		
	var boneLines = [];
	var bones = [];
	var fromTarget = new MoVector2D(450, 0);
	var toTarget = new MoVector2D(-197, 75);
	
/* 	bones.push(new MoIKBoneData(50, 45));
	bones.push(new MoIKBoneData(150, -45));
	bones.push(new MoIKBoneData(250, 45)); */
	
	bones.push(new MoIKBoneData(50, 50));
	bones.push(new MoIKBoneData(100, 100));
	bones.push(new MoIKBoneData(150, 150));
	
	computeBones(bones);
	
	var totalAngle = 0;
	var x = 0;
	var tx = 0;
	var ty = 0;
	var vx = 960;
	var vy = 381;

	for(var i = 0; i < bones.length; ++i)
	{
		totalAngle += bones[i].angle;
		
		var c = Math.cos(totalAngle);
		var s = Math.sin(totalAngle);
		var l = bones[i].length;

		x += l;
		
		var lenC = c*l;
		var lenS = s*l;
		
		var ellipse = new MoShapeEllipse("e");
		ellipse.setWidth(5);
		ellipse.setHeight(5);
		ellipse.setX((tx + vx)-2.5);
		ellipse.setY((-ty + vy)-2.5);
		ellipse.setFill(MoSolidColorBrush.blue());
		
		tx += lenC;
		ty += lenS;
		
		content.add(ellipse);
	}
	
	var ellipse = new MoShapeEllipse("e");
	ellipse.setWidth(5);
	ellipse.setHeight(5);
	ellipse.setX((tx + vx)-2.5);
	ellipse.setY((-ty + vy)-2.5);
	ellipse.setFill(MoSolidColorBrush.blue());
	
	content.add(ellipse);
	
	var solver = new MoIKSolver();
	var pos = getFinalPositionOfBones(bones);
	var targetPos = new MoTranslateTransform(0, 0);
	var a1 = new MoBasicAnimation(targetPos, "x", fromTarget.x, toTarget.x);
	a1.setDuration(2000);
	var a2 = new MoBasicAnimation(targetPos, "y", fromTarget.y, toTarget.y);
	a2.setDuration(2000);
	a1.play();
	a2.play();
	
	setInterval(function() {
		var ccdBones = [];
		var curAngle = 0;
		
		//bones[0].angle += MoMath.degreesToRadians(1);
		//bones[1].angle += MoMath.degreesToRadians(1);
		//bones[2].angle += MoMath.degreesToRadians(1);
		
		//tx = g_mx;
		//ty = g_my;
		
		pos.x = g_mx;
		pos.y = g_my;
		
		//pos.x = targetPos.getX();
		//pos.y = targetPos.getY();
		
		for(var i = 0; i <= bones.length; ++i)
		{
 			var newBone = new MoIKBone(
				(i > 0 ? bones[i-1].length : 0),
				0,
				(i < bones.length ? bones[i].angle : 0));
			
			ccdBones.push(newBone);
		}
		
		for(var i = 0; i < 1; ++i)
		{
			var result = solver.solve(ccdBones, pos.x, pos.y, 1);
			
			if(result != MoIKSolverResult.Running)
				break;
		}
		
		for(var i = 0; i < bones.length; ++i)
			bones[i].angle = ccdBones[i].angle;
	
		while(boneLines.length < bones.length)
		{
			var line = new MoShapeLine("line");
			line.setStroke(MoSolidColorBrush.red());
			line.setStrokeThickness(5);
			
			boneLines.push(line);
			content.add(line);
		}

		var curAngle = 0;
		var viewportCenter = content.getCenter();
		var mx = new MoMatrix2D();
		
		for(var i = 0; i < bones.length; ++i)
		{
			var curBone = bones[i];
			
			curAngle += curBone.angle;
			
			var cosAngle = Math.cos(curAngle);
			var sinAngle = Math.sin(curAngle);
			
			if(i > 0)
			{
				boneLines[i].setX1(boneLines[i-1].getX2());
				boneLines[i].setY1(boneLines[i-1].getY2());
			}
			else
			{
				boneLines[i].setX1(0);
				boneLines[i].setY1(0);
			}
			
			boneLines[i].setX2(boneLines[i].getX1() + cosAngle*curBone.length);
			boneLines[i].setY2(boneLines[i].getY1() + sinAngle*curBone.length);
		}
		
		for(var i = 0; i < boneLines.length; ++i)
		{
			var line = boneLines[i];

			line.setX1(line.getX1() + viewportCenter.x);
			line.setY1(-line.getY1() + viewportCenter.y);
			line.setX2(line.getX2() + viewportCenter.x);
			line.setY2(-line.getY2() + viewportCenter.y);
			
			line.invalidate();
			line.requestMeasure();
		}
		
	}, 1 / 20);
}

function getFinalPositionOfBones(bones) {
	var len = bones.length;
	var globalAngle = 0;
	var bone = null;
	var pos = new MoVector2D(0, 0);
	
	for(var i = 0; i < len; ++i)
	{
		bone = bones[i];
		globalAngle += bone.angle;

		pos.x += Math.cos(globalAngle) * bone.length;
		pos.y += Math.sin(globalAngle) * bone.length;
	}

	return pos;
}

function computeBones(bones) {
	var len = bones.length;
	var angle = 0;
	var bone = null;
	var pos = new MoVector2D(0, 0);
	var length = 0;
	
	for(var i = 0; i < len; ++i)
	{
		bone = bones[i];
		
		angle = MoMath.degreesToRadians(pos.angle(new MoVector2D(bones[i].x, bones[i].y)));
		length = pos.distance(new MoVector2D(bones[i].x, bones[i].y));
		
		pos.x += Math.cos(angle) * length;
		pos.y += Math.sin(angle) * length;
		
		bones[i].angle = angle;
		bones[i].length = length;
	}
}

MoIKSolverResult = {
	Success : 0,
	Running	: 1,
	Failed	: 2
};

MoIKBoneData = Class.create({
	initialize : function(x, y) {
		this.x = x;
		this.y = y;
		this.length = 0;
		this.angle = 0;
	}
});

MoIKBone = Class.create({
	initialize : function(x, y, angle) {
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.angleC = Math.cos(this.angle);
		this.angleS = Math.sin(this.angle);
	}
});

MoIKSolver = Class.create({
	initialize : function() {
		
	},
	
	solve : function(bones, targetX, targetY, distance) {
		var epsilon = 0.0001;
		var arcLength = 0.00001;
		var boneCount = bones.length;
		
		if(boneCount == 0)
			return;
			
		var newBones = [];	
		var arrivalDistanceSqr = distance*distance;
		var rootBone = new MoIKBone(bones[0].x, bones[0].y, bones[0].angle);
		
		newBones.push(rootBone);
		
		for(var i = 1; i < boneCount; ++i)
		{
			var prevBone = newBones[i-1];
			var currBone = bones[i];
			
			var newBone = new MoIKBone(
				prevBone.x + prevBone.angleC * currBone.x - prevBone.angleS * currBone.y,
				prevBone.y + prevBone.angleS * currBone.x + prevBone.angleC * currBone.y,
				prevBone.angle + currBone.angle);
			
			newBones.push(newBone);
		}
		
		var endX = newBones[boneCount-1].x;
		var endY = newBones[boneCount-1].y;
		var modified = false;
		
		for(var i = boneCount-1; i >= 0; --i)
		{

			var curToEndX = endX - newBones[i].x;
			var curToEndY = endY - newBones[i].y;
			var curToEndMag = Math.sqrt(curToEndX*curToEndX + curToEndY*curToEndY);
			
			var curToTargetX = targetX - newBones[i].x;
			var curToTargetY = targetY - newBones[i].y;
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
				
			endX = newBones[i].x + rotAngleC*curToEndX - rotAngleS*curToEndY;
			endY = newBones[i].y + rotAngleS*curToEndX + rotAngleC*curToEndY;
			
			bones[i].angle = this.simplifyAngle(bones[i].angle + rotAngle);
			
			var endToTargetX = (targetX - endX);
			var endToTargetY = (targetY - endY);
			
			if(endToTargetX*endToTargetX + endToTargetY*endToTargetY <= arrivalDistanceSqr)
				return MoIKSolverResult.Success;
			
			if(!modified && Math.abs(rotAngle)*curToEndMag > arcLength)
				modified = true;
		}
		
		if(modified)
			return MoIKSolverResult.Running;

		return MoIKSolverResult.Failed;
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