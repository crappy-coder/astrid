MoImage = Class.create(MoDrawable, {
	initialize : function($super, name, source, sourceRect, enableSourceTiling) {
		$super(name);
		
		this.autoLoad = true;
		this.keepAspectRatio = false;
		this.source = null;
		this.sourceLoaded = false;
		this.changed = false;
		this.nativeImageSlate = null;
		
		if(!MoValueOrDefault(enableSourceTiling, false))
			this.keepAspectRatio = null;

		this.addEventHandler(MoEvent.PRE_INIT, this.handlePreInitEvent.d(this));
			
		this.setSourceRect(MoValueOrDefault(sourceRect, MoRectangle.Empty()));
		this.setEnableSourceTiling(MoValueOrDefault(enableSourceTiling, false));
		this.setSource(source);
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("enableSourceTiling", this.getEnableSourceTiling, this.setEnableSourceTiling, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("sourceRect", this.getSourceRect, this.setSourceRect, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},
	
	getAutoLoad : function() {
		return this.autoLoad;
	},
	
	setAutoLoad : function(value) {
		if(this.autoLoad != value)
		{
			this.autoLoad = value;
			this.changed = true;
			
			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	},

	getKeepAspectRatio : function() {
		return this.keepAspectRatio;
	},

	setKeepAspectRatio : function(value) {
		if(this.keepAspectRatio != value)
		{
			this.keepAspectRatio = value;

			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getEnableSourceTiling : function() {
		return this.getPropertyValue("enableSourceTiling");
	},
	
	setEnableSourceTiling : function(value) {
		if(value && this.getKeepAspectRatio() == null)
			this.setKeepAspectRatio(false);
	
		this.setPropertyValue("enableSourceTiling", value);
	},
	
	getSourceRect : function() {
		return this.getPropertyValue("sourceRect");
	},

	setSourceRect : function(value) {
		this.setPropertyValue("sourceRect", value);
	},
	
	clear : function() {
		if(!MoIsNull(this.nativeImageSlate))
			this.nativeImageSlate.shader.texture = null;
	},
	
	getSource : function() {
		return this.source;
	},

	setSource : function(source) {
		if(this.source != source)
		{		
			this.source = source;
			this.sourceLoaded = false;
			this.changed = true;
			
			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getActualSourceSize : function() {
		var rect = this.getSourceRect();

		if(rect.isEmpty())
			return this.source.getSize();

		return rect.size();
	},
	
	load : function() {
		this.sourceLoaded = false;
		this.changed = false;

		if(this.source != null)
		{
			this.source.addEventHandler(MoSourceEvent.READY, this.handleSourceReadyEvent.d(this));
			this.source.load();
			
			this.requestLayout();
			this.requestMeasure();
		}
	},

	commitProperties : function($super) {
		$super();
		
		this.loadIfNeeded();
	},

	measure : function($super) {
		$super();
		
		if(!this.sourceLoaded)
			return;

		var imageSize = this.getActualSourceSize();
		var keepAspectRatio = (this.keepAspectRatio || this.keepAspectRatio == null);
		var measuredWidth = imageSize.width;
		var measuredHeight = imageSize.height;

		if(keepAspectRatio)
		{
			var exactWidth = this.getExactWidth();
			var exactHeight = this.getExactHeight();
			var percentWidth = this.getPercentWidth();
			var percentHeight = this.getPercentHeight();
			var width = this.getWidth();
			var height = this.getHeight();
			
			// only exact width
			if(!isNaN(exactWidth) && isNaN(exactHeight) && isNaN(percentHeight))
				measuredHeight = exactWidth / measuredWidth * measuredHeight;
			
			// only exact height
			else if(!isNaN(exactHeight) && isNaN(exactWidth) && isNaN(percentWidth))
				measuredWidth = exactHeight / measuredHeight * measuredWidth;
			
			// only percent width
			else if(!isNaN(percentWidth) && isNaN(exactHeight) && isNaN(percentHeight) && width > 0)
				measuredHeight = width / measuredWidth * measuredHeight;

			// only percent height
			else if(!isNaN(percentHeight) && isNaN(exactWidth) && isNaN(percentWidth) && height > 0)
				measuredWidth = height / measuredHeight * measuredWidth;
		}
		
		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		this.loadIfNeeded();
		
		if(!this.sourceLoaded)
			return;
		
		var drawWidth = unscaledWidth;
		var drawHeight = unscaledHeight;
		var keepAspectRatio = (this.keepAspectRatio || this.keepAspectRatio == null);
		
		if(keepAspectRatio)
		{
			var imageSize = this.getActualSourceSize();
			var imageAspectRatio = imageSize.width / imageSize.height;
			var aspectRatio = unscaledWidth / unscaledHeight;
			
			if(imageAspectRatio > aspectRatio)
				drawHeight = unscaledWidth / imageAspectRatio;
			else
				drawWidth = unscaledHeight * imageAspectRatio;
			
			// re-measure if we have either a percentage width or height and our aspect ratios are
			// not the same, we do this so that the percentage can have a chance to be calculated
			// by our parent layout container
			if((!isNaN(this.getPercentWidth()) && isNaN(this.getPercentHeight()) && isNaN(this.getExactHeight())) ||
			   (!isNaN(this.getPercentHeight()) && isNaN(this.getPercentWidth()) && isNaN(this.getExactWidth())))
			{
				if(aspectRatio != imageAspectRatio)
				{
					this.requestMeasure();
					return;
				}
			}
		}

		var sourceRect = this.getSourceRect();
		var tiled = this.getEnableSourceTiling();
		var nativeTexture = this.source.getNativeData();

		if(MoIsNull(this.nativeImageSlate))
		{
			this.nativeImageSlate = engine.createSlate();
			this.nativeImageSlate.shader = engine.createShader("Shaders/vpBasic.cg", "Shaders/fpAlphaPNG.cg");
			this.nativeImageSlate.shader.alpha = [1, 0, 0, 0];

			this.getGraphicsContainer().addChild(this.nativeImageSlate);
		}

		this.nativeImageSlate.shader.texture = nativeTexture;
		this.nativeImageSlate.x = 0;
		this.nativeImageSlate.y = 0;
		this.nativeImageSlate.width = drawWidth;
		this.nativeImageSlate.height = drawHeight;
	},
	
	applyAlpha : function(alpha) {
		if(!MoIsNull(this.nativeImageSlate))
			this.nativeImageSlate.shader.alpha = [alpha, 0, 0, 0];
	},
	
	loadIfNeeded : function() {
		if(this.changed)
		{		
			this.changed = false;
			
			if(this.autoLoad)
				this.load();
		}
	},

	raiseLoadedEvent : function() {
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
	},
	
	handlePreInitEvent : function(e) {
		this.loadIfNeeded();
	},
	
	handleSourceReadyEvent : function(e) {
		this.source.removeEventHandler(MoSourceEvent.READY, this.handleSourceReadyEvent.d(this));
		this.sourceLoaded = true;
		
		this.requestMeasure();
		this.requestLayout();
		this.raiseLoadedEvent();
	}
});

Object.extend(MoImage, {
	/******************************************************************************
	 *
	 * Creates a new MoImage instance from any valid source. The source can be any
	 * of the following values:
	 *    - Url (String)
	 *    - Any type of MoImageSource
	 *    - An HTMLCanvasElement or HTMLVideoElement
	 *
	 * @param		name				The name of the new MoImage instance.
	 * @param		source				Any valid image source, see above.
	 * @optional	sourceRect			A MoRectangle that defines the rectangular
	 *                                  region within the source that should be
	 *                                  drawn.
	 * @optional	enableSourceTiling	True to enable tiling of the image source,
	 *                                  otherwise false.
	 *
	 ******************************************************************************/
	create : function(name, source, sourceRect, enableSourceTiling) {
	
		// TODO : need to throw an error here
		if(name == null || source == null)
			throw new Error("Name or Source is null");

		var actualSource = null;

		// source is already an image source
		if(source instanceof MoImageSource)
			actualSource = source;
		// just try it as a url string
		else
			actualSource = new MoTextureSource(source.toString(), false);

		return new MoImage(name, actualSource, sourceRect, enableSourceTiling);
	}
});
