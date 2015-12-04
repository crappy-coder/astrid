var ITEM_COUNT = 40;
var ITEM_SIZE = 50;

TestApplication = Class.create(MoApplication, {
	initialize : function($super) {		
		$super();
		
		this.surface = null;
		this.mainContent = null;
		this.content = null;
		this.items = [];
		this.setEnableStatsGraph(true);
		//this.setEnableDebugVisuals(true);
		
		this.updateTimer = new MoTimer(1000 / 60);
		this.updateTimer.addEventHandler(MoTimerEvent.TICK, this.onTimerTick.d(this));
		
		this.addEventHandler(MoFrameEvent.ENTER, this.onEnterFrame.d(this));
		this.addEventHandler(MoEvent.APPLICATION_START, this.onApplicationStart.d(this));
	},
	
	onApplicationStart : function(e) {
		this.setBackgroundColor(MoColor.black());
		
		this.surface = this.getDisplaySurfaceAt(0);
		
		this.mainContent = new MoCanvas("mainContent");
		this.mainContent.setPercentWidth(100);
		this.mainContent.setPercentHeight(100);
		this.mainContent.setBackground(MoSolidColorBrush.fromColorHex("#999999"));
		this.surface.setChild(this.mainContent);
		
		
		this.content = new MoCanvas("content");
		this.content.setPercentWidth(100);
		this.content.setPercentHeight(100);
		//this.content.setUseBitmapCaching(true);
		
		this.mainContent.add(this.content);
		
		var appSize = this.getSize();
		
		for(var i = 0; i < ITEM_COUNT; ++i)
		{
			// var item = new MoShapeEllipse("item_" + i);
			// //item.setUseBitmapCaching(true);
			// item.setWidth(ITEM_SIZE);
			// item.setHeight(ITEM_SIZE);
			// item.setX(MoMath.randomInRange(0, appSize.width - ITEM_SIZE));
			// item.setY(MoMath.randomInRange(0, appSize.height - ITEM_SIZE));
			// item.setFill(MoSolidColorBrush.fromColorRGB(MoMath.randomInRange(0, 1.0),MoMath.randomInRange(0, 1.0),MoMath.randomInRange(0, 1.0)));
			
			// this.mainContent.add(item);
			this.items.push({
				width : ITEM_SIZE,
				height : ITEM_SIZE,
				x : MoMath.randomInRange(0, appSize.width - ITEM_SIZE),
				y : MoMath.randomInRange(0, appSize.height - ITEM_SIZE),
				//brush : MoSolidColorBrush.fromColorRGB(0.2, 0.8, 0.2),
				brush : MoRadialGradientBrush.fromColors(MoColor.white(), MoColor.black()),
				dx : 6,
				dy : 6
			});
		}
		
		//this.updateTimer.start();
	},
	
	onEnterFrame : function(e) {
		var appSize = this.getSize();
		var gfx = this.content.getGraphics();
		
		gfx.clear();
		
		for(var i = 0, len = this.items.length; i < len; ++i)
		{
			var item = this.items[i];
			var x = item.x;
			var y = item.y;
			
			if(x >= (appSize.width - ITEM_SIZE) || x <= 0)
				item.dx *= -1;
			
			if(y >= (appSize.height - ITEM_SIZE) || y <= 0)
				item.dy *= -1;
			
			x += item.dx;
			y += item.dy;

			item.x = x;
			item.y = y;
			
			gfx.drawEllipse(item.x, item.y, item.width, item.height, false);
			gfx.fill(item.brush);
		}
	},

	onTimerTick : function(e) {
		var appSize = this.getSize();
	
		for(var i = 0, len = this.items.length; i < len; ++i)
		{
			var item = this.items[i];
			var x = item.item.getX();
			var y = item.item.getY();
			
			if(x >= (appSize.width - ITEM_SIZE) || x <= 0)
				item.dx *= -1;
			
			if(y >= (appSize.height - ITEM_SIZE) || y <= 0)
				item.dy *= -1;
			
			x += item.dx;
			y += item.dy;
				
			item.item.setX(x);
			item.item.setY(y);
		}
	}
});

var g_app = MoApplication.create(TestApplication);