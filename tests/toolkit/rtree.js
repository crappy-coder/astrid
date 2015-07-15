var RECT_COUNT = MoMath.randomIntInRange(5, 200);
var RECT_MIN_SIZE = 20;
var RECT_MAX_SIZE = 120;

TestApplication = Class.create(MoApplication, {
	initialize : function($super) {		
		$super();
		
		this.surface = null;
		this.mainContent = null;
		this.treeSize = 3;
		this.maxDepth = 0;
		
		this.addEventHandler(MoEvent.APPLICATION_START, this.onApplicationStart.d(this));
	},
	
	onApplicationStart : function(e) {
		this.setBackgroundColor(MoColor.black());
		
		this.surface = this.getDisplaySurfaceAt(0);
		
		this.mainContent = new MoCanvas("mainContent");
		this.mainContent.setPercentWidth(100);
		this.mainContent.setPercentHeight(100);
		
		this.surface.setChild(this.mainContent);
		
		var appSize = this.getSize();
		var tree1 = new MoRTree(this.treeSize);
		
		for(var i = 0; i < RECT_COUNT; ++i)
		{
			var rect = new MoRectangle(
				MoMath.randomIntInRange(0, appSize.width - RECT_MAX_SIZE),
				MoMath.randomIntInRange(0, appSize.height - RECT_MAX_SIZE),
				MoMath.randomIntInRange(RECT_MIN_SIZE, RECT_MAX_SIZE),
				MoMath.randomIntInRange(RECT_MIN_SIZE, RECT_MAX_SIZE));

			tree1.insert({x:rect.x,y:rect.y,w:rect.width,h:rect.height}, {id:"r" + i});
			
			var shape = new MoShapeRectangle("r" + i);
			shape.setX(rect.x);
			shape.setY(rect.y);
			shape.setWidth(rect.width);
			shape.setHeight(rect.height);
			shape.setStrokeThickness(1);
			shape.setStroke(MoSolidColorBrush.red());
			this.mainContent.add(shape);
		}
		
		var results = tree1.search({x:0,y:0,w:appSize.width,h:appSize.height}, false);
		//console.log(results);
		
		var root = tree1._T;

		console.log("count: " + RECT_COUNT);
		console.log("tree size: " + this.treeSize);
		
		
		this.recurseTree(root, null);
		
		//console.log(tree1._T);
		//this.recurseTree(tree1._T, 0);

		// var queryRect = new MoRectangle(
				// MoMath.randomIntInRange(0, appSize.width - 200),
				// MoMath.randomIntInRange(0, appSize.height - 300), 200, 300);
				
		// var results = tree1.search({x:queryRect.x,y:queryRect.y,w:queryRect.width,h:queryRect.height});
		// console.log("results:");
		// console.log(results);
		
		// var queryShape = new MoShapeRectangle("q");
		// queryShape.setX(queryRect.x);
		// queryShape.setY(queryRect.y);
		// queryShape.setWidth(queryRect.width);
		// queryShape.setHeight(queryRect.height);
		// queryShape.setStrokeThickness(1);
		// queryShape.setStroke(MoSolidColorBrush.green());
		// this.mainContent.add(queryShape);
		
		// console.log("result count: " + results.length);
		
		// for(var i = 0; i < results.length; ++i)
		// {
			// var shape = this.mainContent.getByName(results[i].id);
			
			// if(shape == null)
			// {
				// console.log("result is invalid:");
				// console.log(results[i]);
				// continue;
			// }

			// shape.setStroke(MoSolidColorBrush.blue());
		// }
	},
	
	drawRect : function(node) {
		var shape = new MoShapeRectangle("s");
		shape.setX(node.x-5);
		shape.setY(node.y-5);
		shape.setWidth(node.w+10);
		shape.setHeight(node.h+10);
		shape.setStrokeThickness(1);
		shape.setStroke(MoSolidColorBrush.green());
		this.mainContent.add(shape);
	},
	
	recurseTree : function(node, prev) {
		if("leaf" in node)			
			return;
		
		if("nodes" in node)
		{
			for(var i = 0; i < node.nodes.length; ++i)
			{
				if("leaf" in node.nodes[i])
				{
					for(var j = 0; j < prev.nodes.length; j++)
						this.drawRect(prev.nodes[j]);
						
					return;
				}
			
				this.recurseTree(node.nodes[i], node);
			}
		}
	}
});

var g_app = MoApplication.create(TestApplication);