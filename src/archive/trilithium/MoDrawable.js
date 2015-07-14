#if platform == "psvita"
MoShaderNames = {
	vpBasic 			: "Shaders/vpBasic.vpo",
	fpAlphaColor 		: "Shaders/fpAlphaColor.fpo",
	fpSolidColor		: "Shaders/fpSolidColor.fpo",
	fpLinearGradient	: "Shaders/mo_fpLinearGradient.fpo",
	fpRadialGradient	: "Shaders/mo_fpRadialGradient.fpo"
};
#else
MoShaderNames = {
	vpBasic 			: "Shaders/vpBasic.cg",
	fpAlphaColor 		: "Shaders/fpAlphaColor.cg",
	fpSolidColor		: "Shaders/fpSolidColor.cg",
	fpLinearGradient	: "Shaders/mo_fpLinearGradient.cg",
	fpRadialGradient	: "Shaders/mo_fpRadialGradient.cg"
};
#endif

MoDrawableFlags = {
	"None"					: 0,
	"InvalidProperties"		: 1,
	"IsPendingMeasure"		: 2,
	"IsPendingLayout"		: 4,
	"IsRoot"				: 8,
	"Initialized"			: 16,
	"IsLayoutVisible"		: 32,
	"Enabled"				: 64,
	"InvalidMatrix"			: 128,
	"UseBitmapCaching"		: 256
};

MoDrawable = Class.create(MoNamedObjectCollection, MoAnimatable, {
	initialize : function($super, name) {
		$super(name);
		
		this.isPendingUpdate = false;
		this.isPendingSceneAddEvent = false;
		this.isPendingFocus = false;
		this.visible = true;
		this.parent = null;
		this.scene = null;
		this.flags = MoDrawableFlags.None;
		this.lastX = 0;
		this.lastY = 0;
		this.lastWidth = 0;
		this.lastHeight = 0;
		this.lastExactWidth = 0;
		this.lastExactHeight = 0;
		this.lastUnscaledWidth = 0;
		this.lastUnscaledHeight = 0;
		this.lastComputedBounds = MoRectangle.Empty();
		this.lastUseBitmapCachingValue = false;
		this.lastScene = null;
		this.isDoubleClickEnabled = true;
		this.isMouseFocusEnabled = true;
		this.isNavigationFocusEnabled = false;
		this.isNavigationZone = false;
		this.isHitTestVisible = true;
		this.isHitTestChildrenEnabled = true;
		this.isFocused = false;
		this.navigationMode = null;
		this.alwaysMeasure = false;
		this.alwaysDirty = false;
		this.horizontalAlignment = MoHorizontalAlignment.Left;
		this.verticalAlignment = MoVerticalAlignment.Top;
		this.layoutX = 0;
		this.layoutY = 0;
		this.alphaChanged = false;
		this.alphaMask = null;
		this.alphaAffectsVisibility = false;
		this.depth = 0;
		this.dock = MoDock.None;
		this.graphics = new MoGraphics(this);
		this.bitmapCache = null;
		this.bitmapEffectCache = null;
		this.renderTransform = null;
		this.renderEffects = null;
		this.userDirtyRegions = new Array();
		this.layoutMatrix = new MoMatrix2D();
		this.globalLayoutMatrix = null;
		this.layoutManager = MoLayoutManager.getInstance();
		this.graphicsObjectRefs = new Array();
		this.selfDirty = false;
		this.touches = new Array();
		this.localBounds = new MoRectangle(0, 0, 0, 0);
		this.globalBounds = new MoRectangle(0, 0, 0, 0);
		this.clipChildren = false;
		this.nativeContainerWrapper = engine.createContainer();
		this.nativeContainerGraphics = null;
		this.nativeContainer = engine.createContainer();
		//this.nativeContainer.addChild(this.nativeContainerGraphics);
		this.nativeContainerWrapper.addChild(this.nativeContainer);
		
		this.tmpRect = MoRectangle.Zero();

		this.setMarginUniform(0);
		this.setX(0);
		this.setY(0);
		this.setWidth(0);
		this.setHeight(0);
		this.setExactWidth(NaN);
		this.setExactHeight(NaN);
		this.setPercentWidth(NaN);
		this.setPercentHeight(NaN);
		this.setMeasuredWidth(0);
		this.setMeasuredHeight(0);
		this.setScaleX(1);
		this.setScaleY(1);
		this.setSkewX(0);
		this.setSkewY(0);
		this.setRotation(0);
		this.setTransformOrigin(MoVector2D.Zero());
		this.setAlpha(1);
		this.setIsLayoutVisible(true);
		this.setEnabled(true);
		this.setUseBitmapCaching(false);
		this.setClip(null);
		
		this.initializeAnimatableProperties();
	},
	
	initializeAnimatablePropertiesCore : function() {
		this.enableAnimatableProperty("marginLeft", this.getMarginLeft, this.setMarginLeft);
		this.enableAnimatableProperty("marginRight", this.getMarginRight, this.setMarginRight);
		this.enableAnimatableProperty("marginTop", this.getMarginTop, this.setMarginTop);
		this.enableAnimatableProperty("marginBottom", this.getMarginBottom, this.setMarginBottom);
		this.enableAnimatableProperty("x", this.getX, this.setX);
		this.enableAnimatableProperty("y", this.getY, this.setY);
		this.enableAnimatableProperty("exactWidth", this.getExactWidth, this.setExactWidth);
		this.enableAnimatableProperty("exactHeight", this.getExactHeight, this.setExactHeight);
		this.enableAnimatableProperty("percentWidth", this.getPercentWidth, this.setPercentWidth);
		this.enableAnimatableProperty("percentHeight", this.getPercentHeight, this.setPercentHeight);
		this.enableAnimatableProperty("measuredWidth", this.getMeasuredWidth, this.setMeasuredWidth);
		this.enableAnimatableProperty("measuredHeight", this.getMeasuredHeight, this.setMeasuredHeight);
		this.enableAnimatableProperty("unscaledWidth", this.getUnscaledWidth, this.setUnscaledWidth);
		this.enableAnimatableProperty("unscaledHeight", this.getUnscaledHeight, this.setUnscaledHeight);
		this.enableAnimatableProperty("width", this.getWidth, this.setWidth);
		this.enableAnimatableProperty("height", this.getHeight, this.setHeight);
		this.enableAnimatableProperty("scaleX", this.getScaleX, this.setScaleX);
		this.enableAnimatableProperty("scaleY", this.getScaleY, this.setScaleY);
		this.enableAnimatableProperty("transformOrigin", this.getTransformOrigin, this.setTransformOrigin);
		this.enableAnimatableProperty("skewX", this.getSkewX, this.setSkewX);
		this.enableAnimatableProperty("skewY", this.getSkewY, this.setSkewY);
		this.enableAnimatableProperty("rotation", this.getRotation, this.setRotation);
		this.enableAnimatableProperty("alpha", this.getAlpha, this.setAlpha);
		this.enableAnimatableProperty("clip", this.getClip, this.setClip);
	},

	readFlag : function(flag) {	
		return ((this.flags & flag) != MoDrawableFlags.None);
	},

	writeFlag : function(flag, value) {
		this.flags = value ? (this.flags | flag) : (this.flags & ~flag);
	},
	
	getGraphicsContainer : function() {
		if(MoIsNull(this.nativeContainerGraphics))
		{
			this.nativeContainerGraphics = engine.createContainer();
			this.nativeContainer.addChildAt(this.nativeContainerGraphics, 0);
		}

		return this.nativeContainerGraphics;
	},
	
	getHasInvalidMatrix : function() {
		return this.readFlag(MoDrawableFlags.InvalidMatrix);
	},
	
	setHasInvalidMatrix : function(value) {
		this.writeFlag(MoDrawableFlags.InvalidMatrix, value);
	},

	getHasInvalidProperties : function() {
		return this.readFlag(MoDrawableFlags.InvalidProperties);
	},
	
	setHasInvalidProperties : function(value) {
		this.writeFlag(MoDrawableFlags.InvalidProperties, value);
	},
	
	getIsPendingMeasure : function() {
		return this.readFlag(MoDrawableFlags.IsPendingMeasure);
	},
	
	setIsPendingMeasure : function(value) {
		this.writeFlag(MoDrawableFlags.IsPendingMeasure, value);
	},
	
	getIsPendingLayout : function() {
		return this.readFlag(MoDrawableFlags.IsPendingLayout);
	},
	
	setIsPendingLayout : function(value) {
		this.writeFlag(MoDrawableFlags.IsPendingLayout, value);
	},
	
	getIsRoot : function() {
		return this.readFlag(MoDrawableFlags.IsRoot);
	},

	setIsRoot : function(value) {
		this.writeFlag(MoDrawableFlags.IsRoot, value);
	},
	
	getUseBitmapCaching : function() {
		return this.readFlag(MoDrawableFlags.UseBitmapCaching);
	},

	setUseBitmapCaching : function(value) {
		if(this.getUseBitmapCaching() != value)
		{
			// bitmap caching must be enabled to use effects, if
			// the value is false just exit
			if((this.renderEffects != null || this.alphaMask != null) && !value)
				return;

			this.writeFlag(MoDrawableFlags.UseBitmapCaching, value);

			this.invalidateProperties();
			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},

	getScene : function() {
		return this.scene;
	},
	
	setScene : function(value) {
		if(this.scene != value)
		{
			this.scene = value;
			
			var len = this.getCount();
			var child = null;

			for(var i = 0; i < len; ++i)
			{
				child = this.getAt(i);

				if(child != null)
					child.setScene(this.scene);
			}
			
			if(!MoIsNull(this.scene) && this.isPendingFocus)
				this.focus();
		}
	},
	
	getParent : function() {
		return this.parent;
	},

	getGraphics : function() {
		return this.graphics;
	},
	
	getAlphaMask : function() {
		return this.alphaMask;
	},

	setAlphaMask : function(value) {
		if(this.alphaMask != value)
		{
			this.alphaMask = value;

			if(this.alphaMask == null)
			{
				if(this.renderEffects == null)
					this.setUseBitmapCaching(this.lastUseBitmapCachingValue);
			}
			else
			{
				if(this.renderEffects == null)
					this.lastUseBitmapCachingValue = this.getUseBitmapCaching();

				this.setUseBitmapCaching(true);
			}
			
			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},

	getRenderEffects : function() {
		return this.renderEffects;
	},

	setRenderEffects : function(value) {
		
		// unregister current effects
		if(this.renderEffects != null)
		{
			for(var i = 0; i < this.renderEffects.length; ++i)
				this.unregisterDependantObject(this.renderEffects[i]);
		}

		this.renderEffects = value;

		if(this.renderEffects == null)
		{
			this.bitmapEffectCache = null;
			
			// reset the bitmap cache back to the previous value
			if(this.alphaMask == null)
				this.setUseBitmapCaching(this.lastUseBitmapCachingValue);
		}
		else
		{
			// register all the render effects as dependant objects so if there
			// properties change we can invalidate the current state and reprocess
			for(var i = 0; i < this.renderEffects.length; ++i)
				this.registerDependantObject(this.renderEffects[i]);

			// bitmap caching must be enabled to use the effects, so we
			// save a copy of the existing value then turn it on, it will
			// be reset if the effects are removed
			if(this.alphaMask == null)
				this.lastUseBitmapCachingValue = this.getUseBitmapCaching();
			
			this.setUseBitmapCaching(true);
		}
		
		// invalidate the bitmap cache so it will
		// be recreated during the next render
		if(this.bitmapCache != null)
		{
			this.bitmapCache.width = 0;
			this.bitmapCache.height = 0;
		}
		
		this.requestMeasure();
		this.requestParentMeasureAndLayout();
	},
	
	getNavigationMode : function(selfOnly) {
		selfOnly = MoValueOrDefault(selfOnly, false);
		
		// we already have one
		if(!MoIsNull(this.navigationMode))
			return this.navigationMode;

		// none on ourself, so go up the parent chain
		// until we find one
		if(!selfOnly)
		{
			var next = this.getParent();

			while(!MoIsNull(next))
			{
				if(!MoIsNull(next.navigationMode))
					return next.navigationMode;
				
				next = next.getParent();
			}
		}

		// still none found so assume normal mode
		return MoNavigationMode.Normal;
	},
	
	setNavigationMode : function(value) {
		this.navigationMode = value;
	},
	
	getIsInitialized : function() {
		return this.readFlag(MoDrawableFlags.Initialized);
	},

	setIsInitialized : function(value) {		
		this.writeFlag(MoDrawableFlags.Initialized, value);

		if(value)
		{
			// ensure that we are visible, but don't raise any
			// events here
			this.setVisible(this.visible, true);

			// notify that we are now officially created
			this.dispatchEvent(new MoEvent(MoEvent.CREATED));
		}
	},

	getIsLayoutVisible : function() {
		return this.readFlag(MoDrawableFlags.IsLayoutVisible);
	},
	
	setIsLayoutVisible : function(value) {
		if(this.getIsLayoutVisible() != value)
		{
			this.writeFlag(MoDrawableFlags.IsLayoutVisible, value);

			var p = this.getParent();

			if(p != null)
			{
				p.requestMeasure();
				p.requestLayout();
			}
		}
	},
	
	getEnabled : function() {
		return this.readFlag(MoDrawableFlags.Enabled);
	},

	setEnabled : function(value) {		
		this.writeFlag(MoDrawableFlags.Enabled, value);
		this.requestLayout();
	},
	
	getVisible : function() {
		return this.visible;
	},

	setVisible : function(value, disableRaiseEvent) {
		disableRaiseEvent = MoValueOrDefault(disableRaiseEvent, false);

		// value is the same, nothing to do 
		if(this.visible == value)
			return;

		this.visible = value;
		this.requestLayout();

		if(!this.visible)
		{
			if(this.nativeContainerWrapper.contains(this.nativeContainer))
				this.nativeContainerWrapper.removeChild(this.nativeContainer);
		}
		else
		{
			if(!this.nativeContainerWrapper.contains(this.nativeContainer))
				this.nativeContainerWrapper.addChild(this.nativeContainer);
		}

		// since we aren't even initialized yet, we don't want
		// to raise any events
		if(!this.getIsInitialized())
			return;

		if(!disableRaiseEvent)
			this.dispatchEvent(new MoEvent((value ? MoEvent.SHOW : MoEvent.HIDE)));
	},

	getIsFocused : function() {
		return this.isFocused;
	},
	
	setIsFocused : function(value) {
		if(this.isFocused != value)
		{
			this.isFocused = value;

			this.invalidateProperties();
			this.requestLayout();
		}
	},
	
	getIsDoubleClickEnabled : function() {
		return this.isDoubleClickEnabled;
	},
	
	setIsDoubleClickEnabled : function(value) {
		this.isDoubleClickEnabled = value;
	},
	
	getIsNavigationZone : function() {
		return this.isNavigationZone;
	},
	
	setIsNavigationZone : function(value) {
		this.isNavigationZone = value;
	},
	
	getIsNavigationFocusEnabled : function() {
		return this.isNavigationFocusEnabled;
	},
	
	setIsNavigationFocusEnabled : function(value) {
		this.isNavigationFocusEnabled = value;
	},
	
	getIsMouseFocusEnabled : function() {
		return this.isMouseFocusEnabled;
	},
	
	setIsMouseFocusEnabled : function(value) {
		this.isMouseFocusEnabled = value;
	},
	
	getIsHitTestVisible : function() {
		return this.isHitTestVisible;
	},
	
	setIsHitTestVisible : function(value) {
		this.isHitTestVisible = value;
	},
	
	getIsHitTestChildrenEnabled : function() {
		return this.isHitTestChildrenEnabled;
	},
	
	setIsHitTestChildrenEnabled : function(value) {
		this.isHitTestChildrenEnabled = value;
	},
	
	getRenderTransform : function() {
		return this.renderTransform;
	},

	setRenderTransform : function(value) {
		if(this.renderTransform != null)
			this.unregisterDependantObject(this.renderTransform);

		if(this.renderTransform != value)
		{
			this.renderTransform = value;

			this.registerDependantObject(this.renderTransform);
			this.requestLayout();
		}
	},

	getLayoutMatrix : function() {
		return this.layoutMatrix;
	},

	getConcatenatedMatrix : function() {
		if(this.globalLayoutMatrix != null)
			return this.globalLayoutMatrix;
		
		var mx = new MoMatrix2D();
		var p = this;
		
		while(p != null)
		{
			mx.append(p.getLayoutMatrix());
			
			if(p != this && p.renderTransform)
				mx.append(p.renderTransform.getValue());
			
			p = p.getParent();
		}

		this.globalLayoutMatrix = mx;

		return mx;
	},
	
	getDock : function() {
		return this.dock;
	},

	setDock : function(value) {
		if(this.dock != value)
		{
			this.dock = value;
			this.requestParentMeasureAndLayout();
		}
	},
	
	getHorizontalAlignment : function() {
		return this.horizontalAlignment;
	},
	
	setHorizontalAlignment : function(value) {
		if(this.horizontalAlignment != value)
		{
			this.horizontalAlignment = value;
			this.invalidateMatrix();
		}
	},
	
	getVerticalAlignment : function() {
		return this.verticalAlignment;
	},
	
	setVerticalAlignment : function(value) {
		if(this.verticalAlignment != value)
		{
			this.verticalAlignment = value;
			this.invalidateMatrix();
		}
	},
	
	getClip : function() {
		return this.getPropertyValue("clip");
	},
	
	setClip : function(value) {
		this.setPropertyValue("clip", value);
	},
	
	getClipChildren : function() {
		return this.clipChildren;
	},

	setClipChildren : function(value) {
		this.clipChildren = value;
	},
	
	getMargin : function() {
		return new MoBorderMetrics(
			this.getMarginLeft(),
			this.getMarginTop(),
			this.getMarginRight(),
			this.getMarginBottom());
	},
	
	getMarginLeft : function() {
		return this.getPropertyValue("marginLeft");
	},
	
	getMarginTop : function() {
		return this.getPropertyValue("marginTop");
	},
	
	getMarginRight : function() {
		return this.getPropertyValue("marginRight");
	},
	
	getMarginBottom : function() {
		return this.getPropertyValue("marginBottom");
	},
	
	setMargin : function() {
		switch(arguments.length)
		{
			case 1:
				this.setMarginUniform(arguments[0]);
				break;
			case 2:
				this.setMarginTop(arguments[0]);
				this.setMarginBottom(arguments[0]);
				this.setMarginLeft(arguments[1]);
				this.setMarginRight(arguments[1]);
				break;
			case 3:
				this.setMarginTop(arguments[0]);
				this.setMarginLeft(arguments[1]);
				this.setMarginRight(arguments[1]);
				this.setMarginBottom(arguments[2]);
				break;
			case 4:
				this.setMarginTop(arguments[0]);
				this.setMarginRight(arguments[1]);
				this.setMarginBottom(arguments[2]);
				this.setMarginLeft(arguments[3]);
				break;
			default:
				this.setMarginUniform(0);
				break;
		}
	},
	
	setMarginUniform : function(value) {
		this.setMargin(value, value, value, value);
	},
	
	setMarginLeft : function(value) {
		if(this.setPropertyValue("marginLeft", value))
			this.invalidateMatrix();
	},

	setMarginTop : function(value) {
		if(this.setPropertyValue("marginTop", value))
			this.invalidateMatrix();
	},
	
	setMarginRight : function(value) {
		if(this.setPropertyValue("marginRight", value))
			this.invalidateMatrix();
	},
	
	setMarginBottom : function(value) {
		if(this.setPropertyValue("marginBottom", value))
			this.invalidateMatrix();
	},
	
	getX : function() {
		return this.getPropertyValue("x");
	},
	
	setX : function(value) {		
		if(this.setPropertyValue("x", value))
		{
			this.layoutX = value;

			this.invalidateMatrix();
			this.invalidateProperties();
		}
	},
	
	getY : function() {
		return this.getPropertyValue("y");
	},
	
	setY : function(value) {		
		if(this.setPropertyValue("y", value))
		{
			this.layoutY = value;
		
			this.invalidateMatrix();
			this.invalidateProperties();
		}
	},
	
	hasExactSize : function() {
		return (!isNaN(this.getExactWidth()) && !isNaN(this.getExactHeight()));
	},

	getExactWidth : function() {
		return this.getPropertyValue("exactWidth");
	},
	
	setExactWidth : function(value) {	
		if(this.setPropertyValue("exactWidth", value))
		{
			if(!isNaN(value))
				this.setPercentWidth(NaN);

			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getExactHeight : function() {
		return this.getPropertyValue("exactHeight");
	},
	
	setExactHeight : function(value) {	
		if(this.setPropertyValue("exactHeight", value))
		{
			if(!isNaN(value))
				this.setPercentHeight(NaN);
			
			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},
	
	hasPercentSize : function() {
		return (!isNaN(this.getPercentWidth()) && !isNaN(this.getPercentHeight()));
	},
	
	getPercentWidth : function() {
		return this.getPropertyValue("percentWidth");
	},
	
	setPercentWidth : function(value) {		
		if(this.setPropertyValue("percentWidth", value))
		{
			if(!isNaN(value))
				this.setExactWidth(NaN);
			
			this.requestParentMeasureAndLayout();
		}
	},
	
	getPercentHeight : function() {
		return this.getPropertyValue("percentHeight");
	},
	
	setPercentHeight : function(value) {		
		if(this.setPropertyValue("percentHeight", value))
		{
			if(!isNaN(value))
				this.setExactHeight(NaN);

			this.requestParentMeasureAndLayout();
		}
	},
	
	getMeasuredWidth : function() {
		return this.getPropertyValue("measuredWidth");
	},
	
	setMeasuredWidth : function(value) {		
		this.setPropertyValue("measuredWidth", value);
	},
	
	getMeasuredHeight : function() {
		return this.getPropertyValue("measuredHeight");
	},
	
	setMeasuredHeight : function(value) {		
		this.setPropertyValue("measuredHeight", value);
	},
	
	getExactOrMeasuredWidth : function() {		
		return !isNaN(this.getExactWidth()) ? this.getExactWidth() : this.getMeasuredWidth();
	},
	
	getExactOrMeasuredHeight : function() {			
		return !isNaN(this.getExactHeight()) ? this.getExactHeight() : this.getMeasuredHeight();
	},
	
	getUnscaledWidth : function() {		
		return this.getWidth();
	},
	
	setUnscaledWidth : function(value) {				
		if(this.getExactWidth() == value)
			return;

		if(!isNaN(value))
			this.setPercentWidth(NaN);

		this.setExactWidth(value);

		this.requestMeasure();
		this.requestParentMeasureAndLayout();
	},
	
	getUnscaledHeight : function() {
		return this.getHeight();
	},
	
	setUnscaledHeight : function(value) {
		if(this.getExactHeight() == value)
			return;
		
		if(!isNaN(value))
			this.setPercentHeight(NaN);
		
		this.setExactHeight(value);
		
		this.requestMeasure();
		this.requestParentMeasureAndLayout();
	},
	
	getWidth : function() {
		return this.getPropertyValue("width");
	},
	
	setWidth : function(value) {	
		if(this.getExactWidth() != value)
		{
			this.setExactWidth(value);
			this.requestMeasure();
		}
		
		if(this.setPropertyValue("width", value))
		{
			this.invalidateProperties();
			this.requestLayout();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getHeight : function() {
		return this.getPropertyValue("height");
	},
	
	setHeight : function(value) {
		if(this.getExactHeight() != value)
		{
			this.setExactHeight(value);
			this.requestMeasure();
		}
		
		if(this.setPropertyValue("height", value))
		{
			this.invalidateProperties();
			this.requestLayout();
			this.requestParentMeasureAndLayout();
		}
	},

	getTransformOrigin : function() {
		return this.getPropertyValue("transformOrigin");
	},
	
	setTransformOrigin : function(value) {
		if(this.setPropertyValue("transformOrigin", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getScaleX : function() {
		return this.getPropertyValue("scaleX");
	},
	
	setScaleX : function(value) {		
		if(this.setPropertyValue("scaleX", value))
		{			
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getScaleY : function() {
		return this.getPropertyValue("scaleY");
	},
	
	setScaleY : function(value) {		
		if(this.setPropertyValue("scaleY", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getSkewX : function() {
		return this.getPropertyValue("skewX");
	},
	
	setSkewX : function(value) {
		if(this.setPropertyValue("skewX", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getSkewY : function() {
		return this.getPropertyValue("skewY");
	},
	
	setSkewY : function(value) {
		if(this.setPropertyValue("skewY", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getRotation : function() {
		return this.getPropertyValue("rotation");
	},
	
	setRotation : function(value) {		
		if(this.setPropertyValue("rotation", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getAlpha : function() {
		return this.getPropertyValue("alpha");
	},

	setAlpha : function(value) {
		if(this.setPropertyValue("alpha", value))
		{
			this.alphaChanged = true;
			
			this.invalidate();
			this.requestLayout();
		}

		if(this.alphaAffectsVisibility)
			this.setVisible(this.getAlpha() > 0);
	},

	getAlphaAffectsVisibility : function() {
		return this.alphaAffectsVisibility;
	},

	setAlphaAffectsVisibility : function(value) {
		this.alphaAffectsVisibility = value;
	},
	
	getDepth : function() {
		return this.depth;
	},
	
	setDepth : function(value) {

		// we are probably not added to any draw hierarcy yet
		// so just exit out, this will be called again when
		// we start to initialize
		if(value == 1 && !this.getIsRoot())
			return;
		
		var nextDepth = value;
		
		// update our depth and notify the layout manager
		// that we have a new depth
		if(value > 0 && this.depth != value)
		{
			this.depth = value;
			this.updateLayoutManager();

			nextDepth++;
		}
		else if(value == 0)
		{
			this.depth = value = 0;
		}
		else
		{
			nextDepth++;
		}

		// update our children's depth as well
		var len = this.getCount();
		var child = null;
		
		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(child != null)
				child.setDepth(nextDepth);
		}
	},

	flipX : function() {
		this.setTransformOrigin(this.getCenter());
		this.setScaleX(-this.getScaleX());
	},

	flipY : function() {
		this.setTransformOrigin(this.getCenter());
		this.setScaleY(-this.getScaleY());
	},

	focus : function() {
		var surface = this.getScene();
		
		this.isPendingFocus = false;
		
		if(!MoIsNull(surface))
			surface.inputManager.focus(this);
		else
			this.isPendingFocus = true;
	},
	
	getNavigationZone : function(allowSelf) {
		allowSelf = MoValueOrDefault(allowSelf, true);

		var next = this;
		
		while(!MoIsNull(next))
		{
			if(next.getVisible() && next.getIsNavigationZone() && (allowSelf || (!allowSelf && next != this)))
				return next;

			next = next.getParent();
		}
		
		return null;
	},
	
	addAt : function($super, child, idx) {
		this.beforeChildAdd(child);
		$super(child, idx);
		this.childAdded(child);
		
		//console.log("adding " + child.getName() + " to " + this.getName() + " at " + idx);

		// need to account for the graphics container, which is always at 0 in the native container (if it exists)
		if(MoIsNull(this.nativeContainerGraphics))
			this.nativeContainer.addChildAt(child.nativeContainerWrapper, idx);
		else
			this.nativeContainer.addChildAt(child.nativeContainerWrapper, idx+1);

		return child;
	},

	beforeChildAdd : function(child) {
		child.changeParentAndScene(this, this.getScene());
		child.setDepth(this.getDepth() + 1);
	},
	
	childAdded : function(child) {
		if(!child.getIsInitialized())
			child.initializeSelf();
	},

	remove : function($super, child) {
		this.beforeChildRemove(child);
		$super(child);
		this.childRemoved(child);

		this.nativeContainer.removeChild(child.nativeContainerWrapper);
		
		return child;
	},
	
	beforeChildRemove : function(child) {

	},
	
	childRemoved : function(child) {
		child.changeParentAndScene(null, null);
		child.scene = null;
	},
	
	removeFromParent : function() {
		var parent = this.getParent();
		
		if(parent != null)
		{
			parent.remove(this);
			parent.invalidate();
		}
	},
	
	updateLayoutManager : function() {
		if(this.getIsPendingLayout())
			this.layoutManager.requestLayout(this);
		
		if(this.getIsPendingMeasure())
			this.layoutManager.requestMeasure(this);
		
		if(this.getHasInvalidProperties())
			this.layoutManager.invalidateProperties(this);

		MoApplication.getInstance().invalidate();
	},

	changeParentAndScene : function(newParent, newScene) {

		var parentChanged = (this.parent != newParent);
		var sceneChanged = (this.scene != newScene);

		if(newParent == null)
		{
			this.parent = null;
			this.setDepth(0);
		}
		else
		{
			this.parent = newParent;
		}

		if(newScene == null)
			this.scene = null;
		else
		{
			this.setScene(newScene);
		}

		if(parentChanged)
		{
			// if the parent and scene changed then we have either been added to or removed
			// from the parent's scene, which means we need fire an update but only after 
			// we have been initialized and our children have been created (in the add case)
			if(sceneChanged)
			{
				if(this.scene == null)
					this.dispatchEvent(new MoEvent(MoEvent.REMOVED_FROM_SCENE));
				else if(!this.getIsInitialized())
					this.isPendingSceneAddEvent = true;
			}

			this.dispatchEvent(new MoEvent(MoEvent.PARENT_CHANGED));
		}
	},

	initializeSelf : function() {
		if(this.getIsInitialized())
			return;
		
		// notify that we are starting initialization
		this.dispatchEvent(new MoEvent(MoEvent.PRE_INIT));
		
		// create the child hierarcy
		this.createChildren();
		
		// notify the the children have been created
		this.raiseChildrenCreatedEvent();

		// notify that initialization has completed
		this.dispatchEvent(new MoEvent(MoEvent.INIT_COMPLETE));
	},
	
	createChildren : function() {
		/** override **/
	},
	
	canValidate : function() {
		return (this.getDepth() > 0);
	},
	
	requestParentMeasureAndLayout : function() {
		if(!this.getIsLayoutVisible())
			return;
		
		var p = this.getParent();

		if(p == null)
			return;
			
		p.requestMeasure();
		p.requestLayout();
	},
	
	validateNow : function() {
		this.layoutManager.validateDrawableNow(this);
	},
	
	invalidateMatrix : function() {
		if(!this.getHasInvalidMatrix())
		{
			this.setHasInvalidMatrix(true);
			
			if(this.getDepth() > 0 && !this.getIsPendingLayout())
				this.layoutManager.requestLayout(this);
		}
	},
	
	invalidateGlobalChildMatrices : function() {
		var len = this.getCount();
		var child = null;
		
		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);
			
			if(child != null && child.getVisible())
				child.invalidateGlobalChildMatrices();
		}

		this.globalLayoutMatrix = null;
	},

	validateMatrix : function() {
		if(this.getHasInvalidMatrix())
		{
			var tx = this.layoutX;
			var ty = this.layoutY;

			this.layoutMatrix.setIdentity();
			this.layoutMatrix.translate(-this.getTransformOrigin().x, -this.getTransformOrigin().y);
			this.layoutMatrix.scale(this.getScaleX(), this.getScaleY());
			this.layoutMatrix.skew(this.getSkewX(), this.getSkewY());
			this.layoutMatrix.rotate(this.getRotation());
			this.layoutMatrix.translate(tx + this.getTransformOrigin().x, ty + this.getTransformOrigin().y);
			this.layoutMatrix.truncateToPrecision(2);

			this.invalidateGlobalChildMatrices();
			this.setHasInvalidMatrix(false);
		}
	},

	invalidateProperties : function() {
		if(!this.getHasInvalidProperties())
		{
			this.setHasInvalidProperties(true);

			if(this.canValidate())
				this.layoutManager.invalidateProperties(this);
		}
	},

	validateProperties : function() {
		if(this.getHasInvalidProperties())
		{
			this.commitProperties();
			this.setHasInvalidProperties(false);
		}
	},

	commitProperties : function() {
		if(this.getUseBitmapCaching())
		{
			// create the cached canvas that we will render into
			if(this.bitmapCache == null)
			{
				this.bitmapCache = document.createElement("canvas");
				this.bitmapCache.width = 0;
				this.bitmapCache.height = 0;
			}
		}
		else
		{
			this.bitmapCache = null;
			this.bitmapEffectCache = null;
		}

		if(this.getX() != this.lastX || this.getY() != this.lastY)
			this.raisePositionChangedEvent();

		if(this.getWidth() != this.lastWidth || this.getHeight() != this.lastHeight)
			this.raiseResizedEvent();
	},

	requestMeasure : function() {
		if(!this.getIsPendingMeasure())
		{
			this.setIsPendingMeasure(true);
			
			if(this.canValidate())
				this.layoutManager.requestMeasure(this);
		}
	},
	
	validateMeasure : function(recursive) {		
		recursive = MoValueOrDefault(recursive, false);

		if(MoPrintMeasureOrder)
			MoDebugWrite("Measure Validation: drawable: #{0}, recursive: #{1}, pending: #{2}", MoDebugLevel.Info, this.getName(), recursive, this.getIsPendingMeasure());

		if(recursive)
		{
			var len = this.getCount();
			var child = null;
			
			for(var i = 0; i < len; ++i)
			{
				child = this.getAt(i);
				
				if(child != null)
					child.validateMeasure(true);
			}
		}
		
		if(this.getIsPendingMeasure())
		{
			var hasSizeChanged = this.performMeasure();
			
			if(MoPrintMeasureOrder)
				MoDebugWrite("\tSize Changed: #{0}", MoDebugLevel.Info, hasSizeChanged);

			if(hasSizeChanged && this.getIsLayoutVisible())
			{
				this.requestLayout();
				this.requestParentMeasureAndLayout();
			}
		}
	},

	performMeasure : function() {
		if(!this.getIsPendingMeasure())
			return false;

		var hasSizeChanged = false;

		// if we have an exact size we can skip the measure pass, as long
		// as the control hasn't ask to always measure
		if(!this.hasExactSize() || this.alwaysMeasure)
		{
			if(MoPrintMeasureOrder)
				MoDebugWrite("\tRan measure(): #{0}", MoDebugLevel.Info, "yes");

			this.measure();
		}
		else
		{
			if(MoPrintMeasureOrder)
				MoDebugWrite("\tRan measure(): #{0}", MoDebugLevel.Info, "no");
		}

		// the measurement is no longer invalid
		this.setIsPendingMeasure(false);
		
		// check if the current size changed since the last
		// time we measured ourself, if so save it so we can
		// check on the next measure
		var newWidth = (!isNaN(this.getExactWidth()) ? this.getExactWidth() : this.getMeasuredWidth());
		
		if(newWidth != this.lastExactWidth)
		{
			this.lastExactWidth = newWidth;
			hasSizeChanged = true;
		}
		
		var newHeight = (!isNaN(this.getExactHeight()) ? this.getExactHeight() : this.getMeasuredHeight());
		
		if(newHeight != this.lastExactHeight)
		{
			this.lastExactHeight = newHeight;
			hasSizeChanged = true;
		}

		if(MoPrintMeasureOrder)
			MoDebugWrite("\tSize: #{0}, #{1}", MoDebugLevel.Info, newWidth, newHeight);

		this.computeBounds();
			
		return hasSizeChanged;
	},
	
	measure : function() {
		this.setMeasuredWidth(0);
		this.setMeasuredHeight(0);
	},
	
	setActualSize : function(w, h) {	
		var changed = false;
		
		if(this.getPropertyValue("width") != w)
		{
			this.setPropertyValue("width", w);
			changed = true;
		}
		
		if(this.getPropertyValue("height") != h)
		{
			this.setPropertyValue("height", h);
			changed = true;
		}
		
		if(changed)
		{
			this.requestLayout();
			this.raiseResizedEvent();
		}
	},

	requestLayout : function() {		
		if(!this.getIsPendingLayout())
		{
			this.setIsPendingLayout(true);
			
			if(this.canValidate())				
				this.layoutManager.requestLayout(this);
		}
	},

	validateLayout : function() {
		if(this.getIsPendingLayout())
		{
			// ensure we have a valid matrix
			this.validateMatrix();
			
			var unscaledWidth = this.getWidth();
			var unscaledHeight = this.getHeight();

			if(!MoIsNull(this.nativeContainerGraphics))
			{
				this.nativeContainerGraphics.width = unscaledWidth;
				this.nativeContainerGraphics.height = unscaledHeight;
			}
			
			this.layout(unscaledWidth, unscaledHeight);
			this.updateClipping();
			
			this.lastUnscaledWidth = unscaledWidth;
			this.lastUnscaledHeight = unscaledHeight;

			this.setIsPendingLayout(false);
		}
		else
		{
			this.validateMatrix();
		}

		if(this.alphaChanged)
		{
			this.alphaChanged = false;
			this.applyAlphaRecursively(1);
		}
		
		this.applyRenderTransforms(this.nativeContainerWrapper);
	},
	
	layout : function(unscaledWidth, unscaledHeight) {
		/** override **/
	},

	setLayoutPosition : function(x, y) {		
		var changed = false;
		
		if(this.layoutX != x)
		{
			this.layoutX = x;
			changed = true;
		}
		
		if(this.layoutY != y)
		{
			this.layoutY = y;
			changed = true;
		}
		
		if(changed)
			this.invalidateMatrix();
	},

	invalidate : function() {
		this.selfDirty = true;
		this.invalidateRegion(this.globalBounds);
	},

	invalidateRegion : function(rect) {	
		//MoDirtyRegionTracker.current().add(rect.x, rect.y, rect.width, rect.height);
		MoApplication.getInstance().invalidate();
	},
	
	getCenter : function(bbox) {
		bbox = MoValueOrDefault(bbox, false);
		
		if(bbox)
			return this.getBounds().center(true);
			
		return new MoVector2D(this.getWidth() * 0.5, this.getHeight() * 0.5);
	},
	
	getGlobalCenter : function() {
		return this.getGlobalBounds().center();
	},

	getGlobalBounds : function() {
		return this.globalBounds;
	},

	getBounds : function() {
		return this.localBounds;
	},

	hitTest : function(x, y, precise) {
		precise = MoValueOrDefault(precise, false);

		if(!this.getVisible())
			return null;

		return this.performHitTestImpl(x, y, precise);
	},
	
	performHitTestImpl : function(x, y, precise) {
		var len = this.getCount();
		var child = null;

		if(len > 0 && this.getIsHitTestChildrenEnabled())
		{
			for(var i = len-1; i >= 0; i--)
			{
				child = this.getAt(i);
				
				if(child != null)
				{
					var found = child.hitTest(x, y, precise);
					
					if(found != null)
						return found;
				}
			}
		}
		
		if(!this.getIsHitTestVisible())
			return null;
		
		if(this.lastComputedBounds.contains(x, y))
		{
			if(precise)
			{
				// TODO : render just a copy of this Graphics object into an in-memory context and try
				//		  isPointInPath or just fallback to the pixel test method
				throw new Error("Precise hit testing not yet implemented.");
			}
			
			// done, the point is within our bounds
			return this;
		}

		// found nothing
		return null;
	},
	
	pointTo : function(drawable, point) {
		var globalPoint = this.pointToGlobal(point);
		var newPoint = drawable.pointToLocal(globalPoint);
		
		return newPoint;
	},

	pointToGlobal : function(point) {
		var mx = this.getConcatenatedMatrix();
		var globalPoint = mx.transformPoint(point);

		return globalPoint;
	},
	
	pointToLocal : function(point) {
		var mx = this.getConcatenatedMatrix().invert();
		var localPoint = mx.transformPoint(point);
		
		return localPoint;
	},

	pointToParent : function(point) {
		return this.pointTo(this.getParent(), point);
	},
	
	handleEvent : function(event) {
		if(event.getType() == MoMouseEvent.DOUBLE_CLICK && !this.getIsDoubleClickEnabled())
			event.stopImmediatePropagation();
		
		// TODO : handle touch/gesture events to build custom pinch/swipe/etc... events
		
		return this.dispatchEvent(event);
	},
	
	raiseChildrenCreatedEvent : function() {
		this.invalidateProperties();
		this.requestMeasure();
		this.requestLayout();
		
		this.dispatchEvent(new MoEvent(MoEvent.CHILDREN_CREATED));

		if(this.isPendingSceneAddEvent)
		{
			this.isPendingSceneAddEvent = false;

			if(this.getScene() != null)			
				this.dispatchEvent(new MoEvent(MoEvent.ADDED_TO_SCENE));
		}
	},
	
	raisePositionChangedEvent : function() {
		this.dispatchEvent(new MoEvent(MoEvent.POSITION_CHANGED));
		this.lastX = this.getX();
		this.lastY = this.getY();
	},

	raiseResizedEvent : function() {
		this.dispatchEvent(new MoEvent(MoEvent.RESIZED));
		this.lastWidth = this.getWidth();
		this.lastHeight = this.getHeight();
	},

	registerDependantObject : function(obj) {
		if(obj == null)
			return;

		obj.togglePropertyChangedHandlerRecursive(this, this.handleDependantObjectPropertyChangedEvent.asDelegate(this), true);
	},

	unregisterDependantObject : function(obj) {
		if(obj == null)
			return;

		obj.togglePropertyChangedHandlerRecursive(this, this.handleDependantObjectPropertyChangedEvent.asDelegate(this), false);
	},
	
	registerGraphicsObject : function(obj) {
		if(obj == null || this.graphicsObjectRefs.contains(obj))
			return;

		this.graphicsObjectRefs.push(obj);
		this.registerDependantObject(obj);
	},
	
	unregisterGraphicsObject : function(obj) {
		if(obj == null || !this.graphicsObjectRefs.contains(obj))
			return;

		this.graphicsObjectRefs.remove(obj);
		this.unregisterDependantObject(obj);
	},
	
	clearGraphicsObjects : function() {
		var len = this.graphicsObjectRefs.length;
		var obj = null;

		for(var i = 0; i < len; ++i)
		{
			obj = this.graphicsObjectRefs[i];

			if(obj != null)
				this.unregisterGraphicsObject(obj);
		}

		this.graphicsObjectRefs = new Array();
	},
	
	handleDependantObjectPropertyChangedEvent : function(event) {

		// this is a very important step, because values may or may not be null when we register the object
		// and javascript doesn't have a way to lookup type information when new, valid values, are added we
		// need to toggle on/off notifications so that we don't cause memory leaks, orphanded handlers, etc...
		var oldValue = event.getOldValue();
		var newValue = event.getNewValue();
		
		// stop receiving notifications from the old value
		if(oldValue != null && oldValue.isAnimatable)
			oldValue.togglePropertyChangedHandlerRecursive(this, this.handleDependantObjectPropertyChangedEvent.asDelegate(this), false);
		
		// start receiving notifications from the new value
		if(newValue != null && newValue.isAnimatable)
			newValue.togglePropertyChangedHandlerRecursive(this, this.handleDependantObjectPropertyChangedEvent.asDelegate(this), true);


		// this is the final very important step to ensure that rendering get's updated when dependent graphics
		// objects change, based on the specified option we execute the appropriate action, property changes may
		// affect either the measure, layout, parent's measure, parent's layout or some combination thereof or 
		// nothing at all
		var propOptions = event.getTarget().getAnimatablePropertyOptions(event.getPropertyName());

		if(propOptions != MoPropertyOptions.None)
		{
			// affects the measure phase
			if((propOptions & MoPropertyOptions.AffectsMeasure) != MoPropertyOptions.None)
				this.requestMeasure();
			
			// affects the layout phase
			if((propOptions & MoPropertyOptions.AffectsLayout) != MoPropertyOptions.None)
				this.requestLayout();
			
			// affects the parent's measure phase
			if((propOptions & MoPropertyOptions.AffectsParentMeasure) != MoPropertyOptions.None)
			{
				if(this.getParent() != null)
					this.getParent().requestMeasure();
			}

			// affects the parent's layout phase
			if((propOptions & MoPropertyOptions.AffectsParentLayout) != MoPropertyOptions.None)
			{
				if(this.getParent() != null)
					this.getParent().requestLayout();
			}

			if((propOptions & MoPropertyOptions.AffectsRender) != MoPropertyOptions.None)
			{
				this.invalidate();
				this.requestLayout();
			}
		}
	},
	
	updateClipping : function() {
		var clip = this.getClip();

		// clip takes priority over clipChildren
		if(!MoIsNull(clip))
		{
			this.nativeContainerWrapper.clipRect.x = clip.x;
			this.nativeContainerWrapper.clipRect.y = clip.y;
			this.nativeContainerWrapper.clipRect.width = clip.width;
			this.nativeContainerWrapper.clipRect.height = clip.height;
		}
		else if(this.clipChildren)
		{
			this.nativeContainerWrapper.clipRect.x = 0;
			this.nativeContainerWrapper.clipRect.y = 0;
			this.nativeContainerWrapper.clipRect.width = this.getUnscaledWidth();
			this.nativeContainerWrapper.clipRect.height = this.getUnscaledHeight();
		}
		else
		{
			this.nativeContainerWrapper.clipRect = null;
		}
	},
	
	applyAlphaRecursively : function(alpha) {
		var actualAlpha = (alpha * this.getAlpha());
 		var child = null;
		
		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);
			child.applyAlphaRecursively(actualAlpha);
		}

		this.applyAlpha(actualAlpha);
	},
	
	applyAlpha : function(alpha) {
		/** override **/
	},

	applyRenderTransforms : function(context) {
		var mx = (this.renderTransform == null ? null : this.renderTransform.getValue());

		if(MoIsNull(mx))
			mx = this.layoutMatrix;
		else
			mx.append(this.layoutMatrix);

		var rotation = mx.decompose(MoMatrixDecompositionType.Rotation);
		var scale = mx.decompose(MoMatrixDecompositionType.Scale);

		context.scaleX = scale.x;
		context.scaleY = scale.y;
		context.rotationZ = MoMath.degreesToRadians(rotation);
		context.x = mx.offsetX;
		context.y = mx.offsetY;
	},
	
	computeBounds : function() {
		var mx = this.getConcatenatedMatrix();
		
		this.tmpRect.x = this.layoutMatrix.offsetX;
		this.tmpRect.y = this.layoutMatrix.offsetY;
		this.tmpRect.width = this.getUnscaledWidth();
		this.tmpRect.height = this.getUnscaledHeight();
		
		if(mx.isIdentity())
		{
			this.globalBounds.copyFrom(this.tmpRect);
			this.localBounds.copyFrom(this.tmpRect);
		}
		else
		{
			this.globalBounds = mx.transformRect(this.tmpRect);
			this.localBounds = mx.invert().transformRect(this.tmpRect);
		}
	},
	
	createBrushData : function(brush) {
		if(brush == null)
			return null;

		var params = null;

		if(brush instanceof MoSolidColorBrush)
			params = this.createSolidColorBrushData(brush);
		else if(brush instanceof MoLinearGradientBrush)
			params = this.createLinearGradientBrushData(brush);
		else if(brush instanceof MoRadialGradientBrush)
			params = this.createRadialGradientBrushData(brush);
		else if(brush instanceof MoImageBrush)
			params = this.createImageBrushData(brush);
		else if(brush instanceof MoVideoBrush)
			params = this.createVideoBrushData(brush);
		else
		{
			MoDebugWrite("createBrushData - found an unknown brush type.", MoDebugLevel.Warning);
			
			// the brush is unknown so just return a solid type with the fallback color
			params = this.createSolidColorBrushData(MoSolidColorBrush.transparent());
			params.push(1); 	// opacity
			params.push(null); 	// matrix

			return params;
		}

		params.push(brush.getOpacity());

		if(brush.getTransform() != null)
			params.push(brush.getTransform().getValue());
		else
			params.push(null);

		return params;
	},
	
	createSolidColorBrushData : function(brush) {
		var color = brush.getColor();

		return [MoGraphicsBrushType.Solid, [color.r, color.g, color.b, color.a]];
	},
	
	createGradientBrushData : function(brush) {
		// currently, we can only support two color stops, so use the first
		// and last stop as our two colors, if either one or both does not
		// exist (very unlikely) then fill in that stop with a a transparent
		// color at the minimum / maximum offset
		var count = brush.getColorStopCount();
		var stopA = (count > 0 ? brush.getColorStop(0) : null);
		var stopB = (count > 1 ? brush.getColorStop(count-1) : null);
		var stops = [];
		
		if(MoIsNull(stopA))
			stops.push([MoColor.transparent(), 0]);
		else
			stops.push([stopA.getColor(), stopA.getOffset()]);

		if(MoIsNull(stopB))
			stops.push([MoColor.transparent(), 1]);
		else
			stops.push([stopB.getColor(), stopB.getOffset()]);

		return stops;
	},
	
	createLinearGradientBrushData : function(brush) {
		return [MoGraphicsBrushType.Linear,
				brush.getStartPoint().x, 
				brush.getStartPoint().y,
				brush.getEndPoint().x, 
				brush.getEndPoint().y,
				this.createGradientBrushData(brush)];
	},
	
	createRadialGradientBrushData : function(brush) {
		return [MoGraphicsBrushType.Radial,
				brush.getStartPoint().x, 
				brush.getStartPoint().y,
				brush.getStartRadius(),
				brush.getEndPoint().x, 
				brush.getEndPoint().y,
				brush.getEndRadius(),
				this.createGradientBrushData(brush)];
	},
	
	createImageBrushData : function(brush) {
		throw new Error("ImageBrush is not supported.");
	},
	
	createVideoBrushData : function(brush) {
		throw new Error("VideoBrush is not supported.");
	},
	
	createShaderFromColor : function(color) {
		var shader = engine.createShader(MoShaderNames.vpBasic, MoShaderNames.fpAlphaColor);
		shader.fillColor = color.toArray();

		return shader;
	},
	
	createShaderFromBrush : function(brush) {
		var data = this.createBrushData(brush);
		
		if(MoIsNull(data))
			return null;

		switch(data[0])
		{
			case MoGraphicsBrushType.Solid:
				return this.createShaderFromSolidColorBrush(data);
			case MoGraphicsBrushType.Linear:
				return this.createShaderFromLinearGradientBrush(data);
			case MoGraphicsBrushType.Radial:
				return this.createShaderFromRadialGradientBrush(data);
			case MoGraphicsBrushType.Image:
				return this.createShaderFromImageBrush(data);
			case MoGraphicsBrushType.Video:
				return this.createShaderFromVideoBrush(data);
		}
		
		return null;
	},

	createShaderFromSolidColorBrush : function(data) {
		var brushOpacity = data[data.length-2];
		var shader = engine.createShader(MoShaderNames.vpBasic, MoShaderNames.fpSolidColor);
		shader.fillColor = [data[1][0], data[1][1], data[1][2], data[1][3] * brushOpacity];

		return shader;
	},

	createShaderFromLinearGradientBrush : function(data) {
		var startX = data[1];
		var startY = data[2];
		var endX = data[3];
		var endY = data[4];
		var stops = data[5];
		var brushOpacity = data[data.length-2];
		var startColor = stops[0][0];
		var startOffset = stops[0][1];
		var endColor = stops[1][0];
		var endOffset = stops[1][1];

		var shader = engine.createShader(MoShaderNames.vpBasic, MoShaderNames.fpLinearGradient);
		shader.startPosition = [startX, startY, 0, 0];
		shader.endPosition = [endX, endY, 0, 0];
		shader.startColor = startColor.toArray();
		shader.endColor = endColor.toArray();
		shader.startOffset = [startOffset, 0, 0, 0];
		shader.endOffset = [endOffset, 0, 0, 0];
		shader.opacity = [brushOpacity, 0, 0, 0];

		return shader;
	},

	createShaderFromRadialGradientBrush : function(data) {
		var startX = data[1];
		var startY = data[2];
		var startRadius = data[3];
		var endX = data[4];
		var endY = data[5];
		var endRadius = data[6];
		var stops = data[7];
		var brushOpacity = data[data.length-2];
		var startColor = stops[0][0];
		var startOffset = stops[0][1];
		var endColor = stops[1][0];
		var endOffset = stops[1][1];

		var shader = engine.createShader(MoShaderNames.vpBasic, MoShaderNames.fpRadialGradient);
		shader.startPosition = [startX, startY, 0, 0];
		shader.endPosition = [endX, endY, 0, 0];
		shader.startRadius = [startRadius, 0, 0, 0];
		shader.endRadius = [endRadius, 0, 0, 0];
		shader.startColor = startColor.toArray();
		shader.endColor = endColor.toArray();
		shader.startOffset = [startOffset, 0, 0, 0];
		shader.endOffset = [endOffset, 0, 0, 0];
		shader.opacity = [brushOpacity, 0, 0, 0];

		return shader;
	},

	createShaderFromImageBrush : function(data) {
		return null;
	},

	createShaderFromVideoBrush : function(data) {
		return null;
	}
});


