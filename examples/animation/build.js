var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");

browserify({ debug: true })
	.transform(babelify.configure({
		loose: "all",
		optional: [
			"runtime"
		]
	}))
	.add("../../src/Extensions.js")
	.require("./js/main.js", { entry: true })
	.bundle()
	.on("error", function (err) {
		console.log("Error: " + err.message);
	})
	.pipe(fs.createWriteStream("./app.js"));
