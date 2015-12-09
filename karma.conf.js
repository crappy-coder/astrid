//
// LOGGING VALUES:
//   - LOG_DISABLE
//   - LOG_ERROR
//   - LOG_WARN
//   - LOG_INFO
//   - LOG_DEBUG
//

module.exports = function(config) {
    config.set({
        basePath: "",
        frameworks: [
            "mocha",
            "should",
            "browserify"
        ],
        files: [
            { pattern: "tests/setup.js", included: true },

            "tests/**/*.test.js"
        ],
        exclude: [
            "tests/feature-support/**/*.*"
        ],
        preprocessors: {
            "tests/setup.js": ["browserify"],
            "tests/**/*.test.js": ["browserify"]
        },
        reporters: ["mocha"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_WARN,
        autoWatch: false,
        browsers: ["Chrome"],
        singleRun: true,
        concurrency: Infinity,
        browserify: {
            debug: true,
            transform: [
                ["babelify", { presets: ["es2015-loose"], sourceMaps: false }]
            ]
        }
    })
}
