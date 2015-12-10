#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var browserify = require("browserify");
var babelify = require("babelify");

const SCRIPT_DIR = __dirname;
const EXAMPLE_REGEX = /\-\-example=(.*)/;
const EXAMPLE_DIR = path.resolve(SCRIPT_DIR, "../examples");

var args = process.argv;
var isExample = false;
var isExampleValid = false;
var buildConfig = {
    debug: false,
    example: null
};

for (var i = 0; i < args.length; i++) {
    if (args[i] === "--debug") {
        buildConfig.debug = true;
        continue;
    }

    if (~args[i].indexOf("--example")) {
        var exampleName = null;
        var exampleMatchResults = null;

        isExample = true;

        // if the example arg is specified with no '=' then it could be building from npm, in which
        // case the next argument should be the name of the example.
        if (args[i] === "--example") {
            if ((i + 1) < args.length) {
                exampleName = args[i+1];
            }
        }

        // otherwise, check if the format is a match and grab the example name value
        if (!exampleName) {
            exampleMatchResults = EXAMPLE_REGEX.exec(args[i]);

            if (exampleMatchResults && exampleMatchResults[1]) {
                exampleName = exampleMatchResults[1];
            }
        }

        if (exampleName) {
            buildConfig.example = {
                name: exampleName,
                path: path.resolve(EXAMPLE_DIR, exampleName)
            };
        }
    }
}

// validate example configuration
if (isExample) {

    // --example argument was added but no example specified
    if (!buildConfig.example) {
        printUsage("no example specified.");
    }

    // check if example exists
    if (!doesDirectoryExist(buildConfig.example.path)) {
        printUsage("the example '" + buildConfig.example.name + "' could not be found.");
    }
}

// build the example
if (buildConfig.example) {
    buildExample();
}
// otherwise just build the package
else {
    build(path.resolve(SCRIPT_DIR, "../src"), "Astrid.js", "../dist/astrid.js");
}

function buildExample() {
    console.log("\u001b[34;1mbuilding example '" + buildConfig.example.name + "'...\u001b[0m");

    build(buildConfig.example.path, "./js/main.js", "./app.js");
}

function build(srcPath, entryFilePath, outFilePath) {

    var babelConfig = babelify.configure({
        presets: ["es2015-loose"],
        sourceMaps: false
    });

    var b = browserify({debug: buildConfig.debug});

    // resolve file paths
    entryFilePath = path.resolve(srcPath, entryFilePath);
    outFilePath = path.resolve(srcPath, outFilePath);

    if (!doesDirectoryExist(path.dirname(outFilePath))) {
        fs.mkdirSync(path.dirname(outFilePath));
    }

    // print the file being processed
    b.on("file", function (fileName) {
        console.log("\u001b[1mPROCESSING\u001b[0m: \u001b[37m" + fileName + "\u001b[0m");
    });

    // print out bundling errors
    b.on("bundle", function (bundle) {
        bundle.on("error", function (err) {
            console.log("\u001b[31;1mERROR\u001b[0m: \u001b[31m" + err.toString() + "\u001b[0m");
            console.log(err.stack);

            if (err.codeFrame) {
                console.log(err.codeFrame);
            }

            process.exit();
        });
    });

    // transform, bundle and pipe to output file
    b.transform(babelConfig)
     .require(entryFilePath, {entry: true})
     .bundle()
     .pipe(fs.createWriteStream(outFilePath));
}

function doesDirectoryExist(path) {
    var result = true;

    try {
        result = fs.statSync(path).isDirectory();
    }
    catch (e) {
        result = false;
    }

    return result;
}

function printUsage(msg) {
    console.log("\u001b[31;1m" + msg + "\u001b[0m");
    console.log("");
    console.log("\u001b[37;1mUsage:\u001b[37m");
    console.log("  node build [--debug] [--example=name]");
    console.log("");
    console.log("  --debug:               Flag indicating whether or not to produce a build for debugging.");
    console.log("  --example=name:        Build one of the examples. The 'name' value should be a directory");
    console.log("                         name located under the /examples directory.");
    console.log("\u001b[0m");

    process.exit();
}
