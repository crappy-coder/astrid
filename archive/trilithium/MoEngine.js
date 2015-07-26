/*
*  MoEnjin
*
*  Graphics development engine for building cross platform games and rich / interactive applications.
*
*  Created by Justin Thomas on 04/04/2010
*  Copyright 2010-2012 Justin Thomas. All rights reserved.
*
*  Dependencies:
*    - Prototype JavaScript Framework v1.7 (prototype.js)
*
*/

//--------------------------------------------------------------------------
//  Array Extensions
//--------------------------------------------------------------------------

Array.prototype.contains = function(item) {
	return (this.indexOf(item) != -1);
};

Array.prototype.remove = function(item) {	
	for(var i = this.length-1; i >= 0; i--)
	{
		if(this[i] == item)
			this.removeAt(i);
	}
};

Array.prototype.removeAt = function(index) {
	this.splice(index, 1);
};


//--------------------------------------------------------------------------
//  Function Extensions
//--------------------------------------------------------------------------

Function.prototype.findEventHandler$ = function(context) {

	// if there is no event handler table for this function instance
	// create one, this is done at the instance level so we do not 
	// generate huge tables instead of using Function.prototype.eventHandlerTable
	// which would be a single instance for all functions
	if(this.eventHandlerTable == null)
	{
		this.eventHandlerTable = [];
		return null;
	}

	// iterate through the table and see if we can find the handler
	// for the specified context, this way we can have multiple handlers
	// for each unique object context
	var len = this.eventHandlerTable.length;

	for(var i = 0; i < len; ++i)
	{
		if(this.eventHandlerTable[i].context == context)
			return this.eventHandlerTable[i].handler;
	}

	return null;
};

Function.prototype.createEventHandler$ = function(context, handler) {
	this.eventHandlerTable.push({context:context, handler:handler});
	
	return handler;
};

Function.prototype.executeHandler = function() {

};

Function.prototype.asDelegate = function(context) {

	if(arguments.length != 1)
		throw new Error("Invalid number of arguments. expected: 1, actual: " + arguments.length.toString());
		
	// if the context is null then just return this function
	if (Object.isUndefined(context))
		return this;

	// see if we can find an existing handler, otherwise
	// create one
	var funcImpl = this;
	var funcHandler = this.findEventHandler$(context);
	
	if(funcHandler == null)
	{
		return this.createEventHandler$(context, function handlerFunc() {
            var ctx = context;
            var args = arguments;
            
			return funcImpl.apply(ctx, args);
		});
	}

	return funcHandler;
};

// short hand for asDelegate
Function.prototype.d = function(context) {
	return this.asDelegate(context);
}

//--------------------------------------------------------------------------
//  String Extensions
//--------------------------------------------------------------------------

/**
 *  Formats a given string in a similar way as printf or the C# 
 *  String.Format, except without type/precision specifiers (i.e. {0:C2}, {0:X}, etc...)
 */
String.format = function(formatString) {

	if(arguments.length > 1)
	{
		var template = new Template(formatString);
		var dict = {};

		for(var i = 1; i < arguments.length; i++)
			dict[(i-1).toString()] = arguments[i];
			
		return template.evaluate(dict);
	}

	return formatString;
};

String.formatWithObjects = function(formatString, objects) {
	return String.format.apply(formatString, objects);
};


//--------------------------------------------------------------------------
//  Sweaky2D Root Class/Namespace
//--------------------------------------------------------------------------

MoDebugLevel = {
	"Normal"	: 1,
	"Info"		: 2,
	"Warning"	: 3,
	"Error"		: 4
};

MoVersion = "1.0";
MoPrintMeasureOrder = false;
MoPrintLayoutOrder = false;
MoCachedTextures = null;
MoDegreeToRadian = Math.PI / 180;
MoRadianToDegree = 180 /  Math.PI;
MoMaxInt =  0x7fffffff;
MoMinInt = -2147483648;
MoMaxFloat = Number.MAX_VALUE;
MoMinFloat = Number.MIN_VALUE;
MoMaxShort =  0x7fff;
MoMinShort = -32768;
MoMaxByte = 255;
MoMinByte = 0;
MoNegativeInfinity = Number.NEGATIVE_INFINITY;
MoPositiveInfinity = Number.POSITIVE_INFINITY;
MoEpsilon = Math.pow(2, -52);
MoTraceElement = null;
MoGamepadsImpl = null;

MoEnsureTextureCache = function() {
	if(MoCachedTextures == null)
		MoCachedTextures = new MoDictionary();
};

MoTextureCacheAdd = function(path, data) {
	MoEnsureTextureCache();
	MoCachedTextures.set(path, data);
};

MoTextureCacheRemove = function(path) {
	MoEnsureTextureCache();
	MoCachedTextures.remove(path);
};

MoTextureCacheGet = function(path) {
	MoEnsureTextureCache();
	return MoCachedTextures.get(path);
};

MoTextureCacheClear = function() {
	MoEnsureTextureCache();
	MoCachedTextures.clear();
};

// TODO: refactor all this ugly debug/trace

MoDebugWrite = function(msg, level) {
	if(console)
	{
		var arr = [];
		arr.push(msg);

		for(var i = 2; i < arguments.length; ++i)
			arr.push(arguments[i]);

		var fmsg = String.formatWithObjects(msg, arr);

		
		// TODO : need to add better console support to the
		// 		  native host, for now, only log is supported
		if(MoIsNativeHost())
			console.log(fmsg);
		else
		{
			switch(level)
			{
				case MoDebugLevel.Info:
					console.info(fmsg);
					break;
				case MoDebugLevel.Warning:
					console.warn(fmsg);
					break;
				case MoDebugLevel.Error:
					console.error(fmsg);
					break;
				default:
					console.log(fmsg);
					break;
			}
		}
	}
};

MoDebugClear = function() {
	if(console)
		console.clear();
};

MoTraceWrite = function(msg) {
	if(MoTraceElement == null)
	{
		MoTraceElement = document.createElement("div");
		MoTraceElement.style.border = "solid 2px #CCCCCC";
		MoTraceElement.style.padding = "5px";
		MoTraceElement.style.backgroundColor = "#FBFBEF";
		MoTraceElement.style.overflow = "auto";
		MoTraceElement.style.height = "200px";
		MoTraceElement.style.fontFamily = "Arial";
		MoTraceElement.style.fontSize = "12px";
		
		document.body.appendChild(MoTraceElement);
	}

	var span = document.createElement("span");
	span.innerHTML = String.formatWithObjects(msg, arguments);
	
	//MoTraceElement.appendChild(document.createTextNode(String.formatWithObjects(msg, arguments)));
	MoTraceElement.appendChild(span);
	MoTraceElement.scrollTop = MoTraceElement.scrollHeight;
};

MoTraceWriteLine = function(msg) {
	MoTraceWrite(String.formatWithObjects(msg, arguments));
	MoTraceElement.appendChild(document.createElement("br"));
};

MoTraceClear = function() {
	if(MoTraceElement != null)
	{
		document.body.removeChild(MoTraceElement);
		MoTraceElement = null;
	}
};

MoLogEvents = function(domElement /** ... **/) {
	var len = arguments.length;
	var extraData = null;
	var arg = null;
	var obj = null;
	
	if(len > 0 && arguments[len-1] instanceof Array)
	{
		extraData = arguments[len-1];
		len -= 1;
	}
	
	obj = { 
			callback: function(e) {
				var str = "";
				
				if(this.extraData != null)
				{
					for(var i = 0; i < this.extraData.length; ++i)
					{
						str += this.extraData[i] + "=" + e.target[this.extraData[i]];
						
						if(i < this.extraData.length-1)
							str += ", ";
					}
				}
				
				console.log("%c[EVENT] - %s (%s)", "color:blue;font-weight:bold", e.type, str);
			},
			extraData: extraData };

	for(var i = 1; i < len; ++i)
	{
		arg = arguments[i];
		domElement.addEventListener(arg, obj.callback.bind(obj), false);
	}
};

MoIsNativeHost = function() {
	return true;
};

MoIsWindows = function() {
	return (MoSystem.getPlatformName() == "Windows");
};

MoIsMac = function() {
	return (MoSystem.getPlatformName() == "Macintosh");
};

MoIsLinux = function() {
	return (MoSystem.getPlatformName() == "Linux");
};

MoIsChrome = function() {
	return (MoSystem.getSystemModel() == "Chrome");
};

MoIsFirefox = function() {
	return (MoSystem.getSystemModel() == "Firefox");
};

MoIsIE = function() {
	return (MoSystem.getSystemModel() == "Internet Explorer");
};

MoIsSafari = function() {
	return (MoSystem.getSystemModel() == "Safari");
};

MoGetPlatformType = function() {
	if(MoIsNativeHost())
		return window.nativePlatformName;

	// check for mobile browser
	var ua = (navigator.userAgent || navigator.vendor || window.opera);

	if(/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4)))
		return "mobile-web";

	return "web";
};

MoGetTimer = function() {
	return MoApplication.getInstance().getRunningTime();
};

MoCreateHttpRequestObject = function() {
	if(XMLHttpRequest)
		return new XMLHttpRequest();
	else
		return new ActiveXObject("Microsoft.XMLHTTP");

	return null;
};

MoRequestAnimationFrame = function(callback, element) {
	MoApplication.getInstance().animationFrameRequests.push(callback);

	return null;
/* 	var nativeFunc = function(callback, element) {
						return setTimeout(function() { 
								callback(Date.now()); 
						}, 0); 
					 };
			
	return nativeFunc(callback, element); */
};

MoCreateGamepads = function(max) {
	max = MoValueOrDefault(max, 0);

	if(MoIsNull(MoGamepadsImpl))
		MoGamepadsImpl = [];

	if(max > MoGamepadsImpl.length)
	{
		var arr = [];
		
		for(var i = 0; i < max; ++i)
		{
			arr.push(null);

			if(i < MoGamepadsImpl.length)
				arr[i] = MoGamepadsImpl[i];
		}

		MoGamepadsImpl = arr;
	}
		
	return MoGamepadsImpl;
};

MoGamepads = function(max) {
	// we can just re-use the null gamepads array
	if(MoIsNativeHost())
		return MoCreateGamepads(max);

	return navigator.gamepads || navigator.webkitGamepads || navigator.mozGamepads || MoCreateGamepads(max);
};

MoValueOrDefault = function(value, defaultValue) {
	return ((value == undefined || value == null) ? defaultValue : value);
};

MoIsNull = function(value) {
	return (value == undefined || value == null);
};

MoStringContains = function(str, value) {
	return (str.indexOf(value) != -1);
};

MoStringIsNullOrEmpty = function(value) {
	if(MoIsNull(value))
		return true;

	return (value.length == 0);
};

MoAreEqual = function(a, b) {
	if(a != null && b != null)
	{
		if((a instanceof MoEquatable) && (b instanceof MoEquatable))
		{
			if(a.constructor === b.constructor)
				return a.isEqualTo(b);
		}
		else if((a instanceof Array) && (b instanceof Array))
		{
			if(a.length != b.length)
				return false;
			
			var arrLen = a.length;
			var arrItemA = null;
			var arrItemB = null;

			for(var i = 0; i < arrLen; ++i)
			{
				arrItemA = a[i];
				arrItemB = b[i];

				if(MoAreNotEqual(arrItemA, arrItemB))
					return false;
			}

			return true;
		}
	}

	return (a == b);
};

MoAreNotEqual = function(a, b) {
	return !MoAreEqual(a, b);
};

MoEnableLocalReadPermission = function() {
	try {
		if (netscape.security.PrivilegeManager.enablePrivilege)
			netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
	}
	catch (e) { 
		MoDebugWrite("Unable to give local read access.", MoDebugLevel.Error);
	}
};


//--------------------------------------------------------------------------
//  Physics Object Mapping
//  
//  TODO : need to allow for multiple engines
//--------------------------------------------------------------------------

if(!MoIsNull(this["Box2D"]))
{
	var PXMatrix2D 					= Box2D.Common.Math.b2Mat22;
	var PXMatrix3D 					= Box2D.Common.Math.b2Mat33;
	var PXMath						= Box2D.Common.Math.b2Math;
	var PXSweep						= Box2D.Common.Math.b2Sweep;
	var PXTransform					= Box2D.Common.Math.b2Transform;
	var PXVector2D 					= Box2D.Common.Math.b2Vec2;
	var PXVector3D 					= Box2D.Common.Math.b2Vec3;
	var PXColor 					= Box2D.Common.b2Color;
	var PXSettings					= Box2D.Common.b2Settings;
	var PXIBroadPhase 				= Box2D.Collision.IBroadPhase;
	var PXAABB 						= Box2D.Collision.b2AABB;
	var PXCollision 				= Box2D.Collision.b2Collision;
	var PXContactID 				= Box2D.Collision.b2ContactID;
	var PXContactPoint 				= Box2D.Collision.b2ContactPoint;
	var PXDistance 					= Box2D.Collision.b2Distance;
	var PXDistanceInput 			= Box2D.Collision.b2DistanceInput;
	var PXDistanceOutput 			= Box2D.Collision.b2DistanceOutput;
	var PXDistanceProxy 			= Box2D.Collision.b2DistanceProxy;
	var PXDynamicTree 				= Box2D.Collision.b2DynamicTree;
	var PXDynamicTreeBroadPhase 	= Box2D.Collision.b2DynamicTreeBroadPhase;
	var PXDynamicTreeNode 			= Box2D.Collision.b2DynamicTreeNode;
	var PXDynamicTreePair 			= Box2D.Collision.b2DynamicTreePair;
	var PXManifold 					= Box2D.Collision.b2Manifold;
	var PXManifoldPoint 			= Box2D.Collision.b2ManifoldPoint;
	var PXPoint 					= Box2D.Collision.b2Point;
	var PXRayCastInput 				= Box2D.Collision.b2RayCastInput;
	var PXRayCastOutput 			= Box2D.Collision.b2RayCastOutput;
	var PXSeparationFunction 		= Box2D.Collision.b2SeparationFunction;
	var PXSimplex 					= Box2D.Collision.b2Simplex;
	var PXSimplexCache 				= Box2D.Collision.b2SimplexCache;
	var PXSimplexVertex 			= Box2D.Collision.b2SimplexVertex;
	var PXTimeOfImpact 				= Box2D.Collision.b2TimeOfImpact;
	var PXTOIInput 					= Box2D.Collision.b2TOIInput;
	var PXWorldManifold 			= Box2D.Collision.b2WorldManifold;
	var PXShape 					= Box2D.Collision.Shapes.b2Shape;
	var PXCircleShape 				= Box2D.Collision.Shapes.b2CircleShape;
	var PXEdgeShape 				= Box2D.Collision.Shapes.b2EdgeShape;
	var PXEdgeChainDef 				= Box2D.Collision.Shapes.b2EdgeChainDef;
	var PXPolygonShape 				= Box2D.Collision.Shapes.b2PolygonShape;
	var PXMassData 					= Box2D.Collision.Shapes.b2MassData;
	var PXContactListener 			= Box2D.Dynamics.b2ContactListener;
	var PXDestructionListener 		= Box2D.Dynamics.b2DestructionListener;
	var PXBody 						= Box2D.Dynamics.b2Body;
	var PXBodyDef 					= Box2D.Dynamics.b2BodyDef;
	var PXContactFilter 			= Box2D.Dynamics.b2ContactFilter;
	var PXContactImpulse 			= Box2D.Dynamics.b2ContactImpulse;
	var PXContactManager 			= Box2D.Dynamics.b2ContactManager;
	var PXDebugDraw 				= Box2D.Dynamics.b2DebugDraw;
	var PXFilterData 				= Box2D.Dynamics.b2FilterData;
	var PXFixture 					= Box2D.Dynamics.b2Fixture;
	var PXFixtureDef 				= Box2D.Dynamics.b2FixtureDef;
	var PXIsland 					= Box2D.Dynamics.b2Island;
	var PXTimeStep 					= Box2D.Dynamics.b2TimeStep;
	var PXWorld	 					= Box2D.Dynamics.b2World;
	var PXContact 					= Box2D.Dynamics.Contacts.b2Contact;
	var PXCircleContact 			= Box2D.Dynamics.Contacts.b2CircleContact;
	var PXContactConstraint 		= Box2D.Dynamics.Contacts.b2ContactConstraint;
	var PXContactConstraintPoint 	= Box2D.Dynamics.Contacts.b2ContactConstraintPoint;
	var PXContactEdge				= Box2D.Dynamics.Contacts.b2ContactEdge;
	var PXContactFactory 			= Box2D.Dynamics.Contacts.b2ContactFactory;
	var PXContactRegister 			= Box2D.Dynamics.Contacts.b2ContactRegister;
	var PXContactResult 			= Box2D.Dynamics.Contacts.b2ContactResult;
	var PXContactSolver 			= Box2D.Dynamics.Contacts.b2ContactSolver;
	var PXNullContact 				= Box2D.Dynamics.Contacts.b2NullContact;
	var PXEdgeAndCircleContact 		= Box2D.Dynamics.Contacts.b2EdgeAndCircleContact;
	var PXPolyAndCircleContact 		= Box2D.Dynamics.Contacts.b2PolyAndCircleContact;
	var PXPolyAndEdgeContact 		= Box2D.Dynamics.Contacts.b2PolyAndEdgeContact;
	var PXPolygonContact 			= Box2D.Dynamics.Contacts.b2PolygonContact;
	var PXPositionSolverManifold 	= Box2D.Dynamics.Contacts.b2PositionSolverManifold;
	var PXBuoyancyController 		= Box2D.Dynamics.Controllers.b2BuoyancyController;
	var PXConstantAccelController 	= Box2D.Dynamics.Controllers.b2ConstantAccelController;
	var PXConstantForceController 	= Box2D.Dynamics.Controllers.b2ConstantForceController;
	var PXController 				= Box2D.Dynamics.Controllers.b2Controller;
	var PXControllerEdge 			= Box2D.Dynamics.Controllers.b2ControllerEdge;
	var PXGravityController 		= Box2D.Dynamics.Controllers.b2GravityController;
	var PXTensorDampingController 	= Box2D.Dynamics.Controllers.b2TensorDampingController;
	var PXDistanceJoint 			= Box2D.Dynamics.Joints.b2DistanceJoint;
	var PXDistanceJointDef 			= Box2D.Dynamics.Joints.b2DistanceJointDef;
	var PXFrictionJoint 			= Box2D.Dynamics.Joints.b2FrictionJoint;
	var PXFrictionJointDef 			= Box2D.Dynamics.Joints.b2FrictionJointDef;
	var PXGearJoint 				= Box2D.Dynamics.Joints.b2GearJoint;
	var PXGearJointDef 				= Box2D.Dynamics.Joints.b2GearJointDef;
	var PXJacobian 					= Box2D.Dynamics.Joints.b2Jacobian;
	var PXJoint 					= Box2D.Dynamics.Joints.b2Joint;
	var PXJointDef 					= Box2D.Dynamics.Joints.b2JointDef;
	var PXJointEdge 				= Box2D.Dynamics.Joints.b2JointEdge;
	var PXLineJoint 				= Box2D.Dynamics.Joints.b2LineJoint;
	var PXLineJointDef 				= Box2D.Dynamics.Joints.b2LineJointDef;
	var PXMouseJoint 				= Box2D.Dynamics.Joints.b2MouseJoint;
	var PXMouseJointDef 			= Box2D.Dynamics.Joints.b2MouseJointDef;
	var PXPrismaticJoint 			= Box2D.Dynamics.Joints.b2PrismaticJoint;
	var PXPrismaticJointDef 		= Box2D.Dynamics.Joints.b2PrismaticJointDef;
	var PXPulleyJoint 				= Box2D.Dynamics.Joints.b2PulleyJoint;
	var PXPulleyJointDef 			= Box2D.Dynamics.Joints.b2PulleyJointDef;
	var PXRevoluteJoint 			= Box2D.Dynamics.Joints.b2RevoluteJoint;
	var PXRevoluteJointDef 			= Box2D.Dynamics.Joints.b2RevoluteJointDef;
	var PXWeldJoint 				= Box2D.Dynamics.Joints.b2WeldJoint;
	var PXWeldJointDef 				= Box2D.Dynamics.Joints.b2WeldJointDef;
}