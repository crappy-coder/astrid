#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var chalk = require("chalk");

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

console.log(chalk.bold.white("GENERATING EXPORTS IN '%s'..."), path.relative(BASE_DIR, outputFilePath));

gatherListOfFiles(SOURCE_DIR, function(files) {
    files.forEach(function(file) {
        file = "./" + path.relative(SOURCE_DIR, file);
        file = file.replace(/\\/g, "/");

        console.log(chalk.bold.blue("EXPORTING: %s"), chalk.white(file));

        str += "export * from \"" + file + "\"\n";
    });

    fs.writeFile(outputFilePath, str, function(err) {
        if(err) {
            console.log(chalk.bold.red("ERROR: %s", err));
            process.exit();
        }

        console.log(chalk.green("%d files added to export list."), files.length);
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
    console.log(chalk.bold.red(msg));
    console.log("");
    console.log(chalk.bold.white("Usage:"));
    console.log(chalk.white("  node generate-exports [--output-path=path]"));
    console.log("");
    console.log(chalk.white("  --output-path=path:        Path where the exports file should be generated. The 'path' value should be an absolute or"));
    console.log(chalk.white("                             relative path to the project directory."));

    process.exit();
}
