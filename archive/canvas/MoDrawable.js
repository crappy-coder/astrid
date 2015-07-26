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
		this.dirtyRegion = new MoDirtyRegion();
		this.lastDirtyRegion = null;
		this.selfDirty = false;
		this.touches = new Array();
		this.localBounds = new MoRectangle(0, 0, 0, 0);
		this.globalBounds = new MoRectangle(0, 0, 0, 0);
		this.clipChildren = false;

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
			
			this.invalidate();
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
				
			if(hasSizeChanged)
				this.invalidate();

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

		// if we don't have an exact size we can skip the measure pass, as long
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
			this.invalidate();
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
			
			this.layout(unscaledWidth, unscaledHeight);
			
			this.lastUnscaledWidth = unscaledWidth;
			this.lastUnscaledHeight = unscaledHeight;
			
			this.setIsPendingLayout(false);
		}
		else
		{
			this.validateMatrix();
		}
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
		this.invalidateRegion(this.globalBounds.x, this.globalBounds.y, this.globalBounds.width, this.globalBounds.height);
	},

	invalidateRegion : function(x, y, width, height) {
		this.dirtyRegion.grow(x, y, x + width, y + height);
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
	
	areAnyGraphicsDirty : function() {
		if(this.selfDirty || this.graphics.getHasChangedSinceLastRender())
			return true;
	
		var len = this.getCount();
		var c = null;
		
		for(var i = 0; i < len; ++i)
		{
			c = this.getAt(i);
			
			if(c.getVisible())
				return c.areAnyGraphicsDirty();
		}

		return false;
	},
	
	updateDirtyRegions : function() {
		var len = this.getCount();
		var c = null;

		for(var i = 0; i < len; ++i)
		{
			c = this.getAt(i);
			
			if(c.getVisible())
				c.updateDirtyRegions();
		}
	
		// FIXME : need to update this so we do not have to compute the global
		//         bounds during every single render
		
		// get the new bounds from our graphics, if the graphics does not have
		// any strokes then the non-stroked bounds will just be returned
		this.computeBounds(this.graphics.getStrokeBounds());
		
		// add a dirty region if the bounds have changed or any of our graphics
		// are dirty
		if(this.globalBounds.isNotEqualTo(this.lastComputedBounds) || this.areAnyGraphicsDirty())
		{
			// the the region tracker perform the intersections
			MoDirtyRegionTracker.current().add(this.lastComputedBounds.x-4, this.lastComputedBounds.y-4, this.lastComputedBounds.width+8, this.lastComputedBounds.height+8);
			MoDirtyRegionTracker.current().add(this.globalBounds.x, this.globalBounds.y, this.globalBounds.width, this.globalBounds.height);
			
			this.lastComputedBounds.x = this.globalBounds.x;
			this.lastComputedBounds.y = this.globalBounds.y;
			this.lastComputedBounds.width = this.globalBounds.width;
			this.lastComputedBounds.height = this.globalBounds.height;
		}
	},

	renderRecursive : function(gfx) {
		if(this.getUnscaledWidth() <= 0 || this.getUnscaledHeight() <= 0)
			return;
		
		// save the current bounds
		this.lastComputedBounds.x = this.globalBounds.x;
		this.lastComputedBounds.y = this.globalBounds.y;
		this.lastComputedBounds.width = this.globalBounds.width;
		this.lastComputedBounds.height = this.globalBounds.height;
		
		gfx.save();
		
		// we have a bitmap cached, this might be either from the user
		// or from an effect, to use effects bitmap caching must be used,
		// otherwise we would still have to generate this bitmap to render
		// the effects
		if(this.bitmapCache != null)
			this.renderBitmapCache(gfx);

		// nothing unusual, so just render normally
		else
			this.renderRecursiveImpl(gfx, false);

		gfx.restore();

		// compute the local/global bounds, this will give us the actual bounds
		// based on what was actually rendered
		this.computeBounds(this.graphics.getStrokeBounds());
		
		// save the current dirty region and reset it
		this.lastDirtyRegion = this.dirtyRegion.copy();
		this.dirtyRegion.clear();

		// reset dirty flag
		this.selfDirty = false;
	},

	renderBitmapCache : function(gfx) {
		var cacheWidth = this.bitmapCache.width;
		var cacheHeight = this.bitmapCache.height;
		var cacheSizeChanged = false;
		var cacheGfx = this.bitmapCache.getContext("2d");
		var renderableBitmap = this.bitmapCache;
		
		// the cache size and our size has changed so we need to reset our current
		// cache, which will invalidate it and require us to redraw
		if(cacheWidth != this.getUnscaledWidth() || cacheHeight != this.getUnscaledHeight())
		{
			this.bitmapCache.width = Math.ceil(this.getUnscaledWidth());
			this.bitmapCache.height = Math.ceil(this.getUnscaledHeight());

			cacheWidth = this.bitmapCache.width;
			cacheHeight = this.bitmapCache.height;
			cacheSizeChanged = true;
		}

		// we optimize by only redrawing if either the cache size has changed or
		// if the user graphics has changed since the previous update
		if(cacheSizeChanged || this.areAnyGraphicsDirty())
		{
			// erase the entire cache surface
			cacheGfx.clearRect(0, 0, this.bitmapCache.width , this.bitmapCache.height);

			// now we can render into our cache context as usual, however, instead of
			// applying the top level translation here we always render in the top left
			// corner and apply the translations once the final bitmap has been composited
			this.renderRecursiveImpl(cacheGfx, true);

			// finally, once the source bitmap has been composited we apply any render
			// effects to it, which will give us the final bitmap that will be used for
			// rendering to the display
			if(this.renderEffects != null && this.renderEffects.length > 0)
			{
				var len = this.renderEffects.length;
				var fx = null;
				var fxGfx = null;

				for(var i = 0; i < len; ++i)
				{
					fx = this.renderEffects[i];

					if(fx == null)
						continue;

					// reset the effect to our source bitmap size
					fx.reset(new MoSize(cacheWidth, cacheHeight));

					// draw the currently composited bitmap, as we iterate, this bitmap
					// is reassigned so that each effect is layered one on top of the other
					// which will give us a bitmap with all the effects
					fxGfx = fx.getEffectContext();
					fxGfx.drawImage(renderableBitmap, 0, 0);

					if(fx.process(this))
						renderableBitmap = fx.getEffectCanvas();
				}

				this.bitmapEffectCache = renderableBitmap;
			}
		}

		// we might have a cache of the bitmap effects, if so, we will use
		// this instead of the bitmap cache
		if(this.bitmapEffectCache != null)
			renderableBitmap = this.bitmapEffectCache;

		// the size of our drawable and the actual render size might differ, in which case
		// we need to compensate for this so we can re-align ourself to the correct position
		var dx = (this.getUnscaledWidth() - renderableBitmap.width) * 0.5;
		var dy = (this.getUnscaledHeight() - renderableBitmap.height) * 0.5;
		
		// finally we can actually render our bitmap, in this case, it's going to either
		// be the bitmapCache or the bitmapEffectCache

		this.applyRenderTransforms(gfx);
		
		gfx.drawImage(renderableBitmap, 0, 0, renderableBitmap.width, renderableBitmap.height, dx, dy, renderableBitmap.width, renderableBitmap.height);			
	},

	renderRecursiveImpl : function(gfx, skipTransform) {
		skipTransform = MoValueOrDefault(skipTransform, false);

		// set the user clip region, if specified, so that
		// it clips the entire content but is not affected
		// by any layout/render transformations
		var clip = this.getClip();
		
		if(!MoIsNull(clip))
		{
			gfx.beginPath();
			gfx.rect(clip.x, clip.y, clip.width, clip.height);
			gfx.clip();
		}

		// apply layout and render transforms, unless a skip
		// is requested (i.e. when drawing from bitmap cache)
		if(!skipTransform)
			this.applyRenderTransforms(gfx);

		// update the global alpha
		gfx.globalAlpha *= this.getAlpha();
		
		// perform the actual render operation
		this.graphics.render(gfx);
		
		// when specified, clip just the child content
		if(this.clipChildren)
		{
			gfx.beginPath();
			gfx.rect(0, 0, this.getUnscaledWidth(), this.getUnscaledHeight());
			gfx.clip();
		}
		
		// go ahead and run through our children and
		// try to render any visible ones
		//
		// TODO : should children that are not included
		//        in the layout be discarded?
		//
		var len = this.getCount();
		var child = null;

		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(MoIsNull(child))
				continue;
			
			if(child.getVisible())
				child.renderRecursive(gfx);
		}

		// finally we need to render our alpha mask, if we have one, this is only done
		// when bitmap caching is enabled, since we need to change the compositing 
		// operation we don't want to affect the main context
		if(this.alphaMask != null)
			this.graphics.renderAlphaMask(gfx, this.alphaMask, this.getUnscaledWidth(), this.getUnscaledHeight());
	},

	applyRenderTransforms : function(context) {

		//***********************************************************************************************
		// we optimize here by applying both transforms independently, it would be significantly slower
		// to allocate a new matrix and multiply these together each time they change or render, the
		// native context implementation will be able to handle the math much faster
		//***********************************************************************************************

		context.transform(this.layoutMatrix.m11, this.layoutMatrix.m12, this.layoutMatrix.m21, this.layoutMatrix.m22, this.layoutMatrix.offsetX, this.layoutMatrix.offsetY);

		var mx = (this.renderTransform == null ? null : this.renderTransform.getValue());

		if(mx != null)
			context.transform(mx.m11, mx.m12, mx.m21, mx.m22, mx.offsetX, mx.offsetY);
	},
	
	computeBounds : function(strokedBounds) {
		var mx = (this.renderTransform == null ? new MoMatrix2D() : this.renderTransform.getValue());
		var rect = new MoRectangle(strokedBounds.x, strokedBounds.y, strokedBounds.width, strokedBounds.height);
		
		if(rect.isZero())
		{
			rect.width = this.getUnscaledWidth();
			rect.height = this.getUnscaledHeight();
		}
		
		// if we have any render effects then we will have to take them
		// into account as well since they may go outside of our initial bounds
		// i.e. for a drop shadow or blur effect
		if(this.renderEffects != null && this.renderEffects.length > 0)
		{
			var len = this.renderEffects.length;
			var fx = null;

			for(var i = 0; i < len; ++i)
			{
				fx = this.renderEffects[i];
				
				if(fx == null)
					continue;

				rect.unionWithRect(fx.getRenderBounds(rect));
			}
		}

		mx.append(this.getConcatenatedMatrix());
		
		if(mx.isIdentity())
		{
			this.globalBounds.copyFrom(rect);
			this.localBounds.copyFrom(rect);
		}
		else
		{
			this.globalBounds = mx.transformRect(rect);
			this.localBounds = mx.invert().transformRect(rect);
		}

		//console.log(this.name + " computed: " + this.globalBounds.toString());
	}
});


