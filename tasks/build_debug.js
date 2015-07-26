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
	.require("./src/Astrid.js", { entry: true })
	.bundle()
	.on("error", function (err) {
		console.log("Error: " + err.message);
	})
	.pipe(fs.createWriteStream("dist/astrid.js"));
