const {exec} = require('child_process');
const path = require("path");

const startDelay = Math.max(0, Number(process.argv[2] || 0) - Date.now());

setTimeout(() => {
  console.log("Running React Sample...");

  exec('npm install && npm start', {cwd: path.resolve('.\\SPA')}, (err, output) => {
    // once the command has completed, the callback function is called
    if (err) {
      // log and return if we encounter an error
      console.error("Error on running commands: ", err)
      return
    }
    // log the output received from the command
    console.log("Output: \n", output)
  })
}, startDelay)
