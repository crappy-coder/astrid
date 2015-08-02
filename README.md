# astrid


## Examples

To run:
* Run `npm install` inside root astrid folder.
* Run a local server from the root astrid folder.
* Inside the folder for the example you want to load, run `node build.js`. This will look for the main.js file for that example, see what files it requires from the framework and build from that everything it needs into one file.
* Open the example's `index.html` file.


## Building

Builds are currently done user-side which can be seen in the examples. Below are details on how to create a standalone framework build which is not yet supported.

First install dependencies:

`npm install`

Then there is a debug build you can run for development currently:

`npm run build:debug`

This will create a single built file `astrid.js` in the `/dist` folder. 
