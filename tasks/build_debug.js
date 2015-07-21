var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");

browserify({ debug: true })
    .transform(babelify)
    .require("./src/Application.js", { entry: true })
    .bundle()
    .on("error", function (err) {
        console.log("Error: " + err.message);
    })
    .pipe(fs.createWriteStream("output/astrid.js"));
