const { spawn } = require("child_process");
const path = require("path");

module.exports = function (devMode = false) {

    const projectRoot = process.cwd();
    const indexFile = path.join(projectRoot, "index.js");

    if (!devMode) {
        console.log("🚀 Starting server...");
        spawn("node", [indexFile], { stdio: "inherit" });
        return;
    }

    console.log("🔥 DEV MODE (nodemon) starting...");
    spawn("npx", ["nodemon", indexFile], { stdio: "inherit", shell: true });
};
