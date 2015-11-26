var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");
var execFile = require("child_process").execFile;

browserify({ debug: true })
	.on("file", function(fileName) {
		console.log("\u001b[1mPROCESSING\u001b[0m: \u001b[34m" + fileName + "\u001b[0m");
	})
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
		console.log("\u001b[31;1mERROR\u001b[0m: \u001b[31m" + err.message + "\u001b[0m");

		if(err.codeFrame)
			console.log(err.codeFrame);

		process.exit();
	})
	.pipe(fs.createWriteStream("./app.js"))
	.on("finish", function() {
		if(process.argv.indexOf("--run") !== -1)
		{
			execFile("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", ["http://localhost:63342/astrid/examples/webgl-renderer/index.html"]);
			process.exit();
		}
	});
