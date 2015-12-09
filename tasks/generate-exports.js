#!/usr/bin/env node

var fs = require("fs");
var path = require("path");

const SCRIPT_DIR = __dirname;
const BASE_DIR = path.resolve(SCRIPT_DIR, "../");
const SOURCE_DIR = path.resolve(BASE_DIR, "./src");
const OUTPUT_REGEX = /\-\-output\-path=(.*)/;

var args = process.argv;
var outputFilePath = null;

for(var i = 0; i < args.length; i++) {
    if(~args[i].indexOf("--output-path")) {
        var result = OUTPUT_REGEX.exec(args[i]);

        if (result && result[1]) {
            outputFilePath = path.resolve(BASE_DIR, result[1]);
        }
    }
}

if(!outputFilePath) {
    printUsage("no output file path specified.");
}

var str = "";

gatherListOfFiles(SOURCE_DIR, function(files) {
    files.forEach(function(file) {
        file = "./" + path.relative(SOURCE_DIR, file);
        file = file.replace(/\\/g, "/");

        str += "export * from \"" + file + "\"\n";
    });

    fs.writeFile(outputFilePath, str, function(err) {
        if(err) {
            console.error(err);
            process.exit();
        }

        console.log("%d files added to export list.", files.length);
    });
});

function gatherListOfFiles(fromDirPath, callback) {
    var enumerateFiles = function(dirPath, done) {
        var list = [];

        fs.readdir(dirPath, function(err, files) {
            if(err) {
                return done(err);
            }

            var remain = files.length;

            if(remain === 0) {
                return done(null, list);
            }

            files.forEach(function(file) {
                file = path.resolve(dirPath, file);

                if(doesDirectoryExist(file)) {
                    enumerateFiles(file, function(err, results) {
                        list = list.concat(results);

                        if(--remain === 0) {
                            return done(null, list);
                        }
                    });
                }
                else {
                    list.push(file);

                    if(--remain === 0) {
                        return done(null, list);
                    }
                }

            });
        });
    };

    enumerateFiles(fromDirPath, function(err, list) {
        if(err) {
            console.error(err);
            process.exit();
        }

        callback(list);
    });
}

function doesFileExist(path) {
    var result = true;

    try {
        result = fs.statSync(path).isFile();
    }
    catch (e) {
        result = false;
    }

    return result;
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
    console.log("  node generate-exports [--output-path=path]");
    console.log("");
    console.log("  --output-path=path:        Path where the exports file should be generated. The 'path' value should be an absolute or");
    console.log("                             relative path to the project directory.");
    console.log("\u001b[0m");

    process.exit();
}
