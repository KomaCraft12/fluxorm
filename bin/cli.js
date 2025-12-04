#!/usr/bin/env node

const path = require("path");
const args = process.argv.slice(2);
const command = args[0];
const name = args[1];

require("dotenv").config({ path: path.join(process.cwd(), ".env") });

// ───────────────────────────────────────────
//  COOL ASCII BANNER
// ───────────────────────────────────────────
const banner = `
  ██████╗  ██████╗ ███╗   ███╗
  ██╔══██╗██╔═══██╗████╗ ████║
  ██████╔╝██║   ██║██╔████╔██║   KOMA ORM
  ██╔══██╗██║   ██║██║╚██╔╝██║   Developer CLI
  ██║  ██║╚██████╔╝██║ ╚═╝ ██║   by Janó
  ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝
`;

function showHelp() {
    console.log(banner);
    console.log("Usage:");
    console.log("  orm <command> [arguments]\n");

    console.log("Available Commands:");
    console.log("  make:model           Generate a new Model file");
    console.log("  make:controller      Generate a Controller");
    console.log("  make:migration       Create a migration file");
    console.log("  make:seed            Create a seed file\n");

    console.log("Database:");
    console.log("  migrate              Run all pending migrations");
    console.log("  migrate:rollback     Rollback last batch");
    console.log("  seed                 Run all seeds\n");

    console.log("Server:");
    console.log("  serve                Start API server");
    console.log("  serve --dev          Start API with nodemon (DEV mode)\n");

    console.log("Utility:");
    console.log("  init                 Initialize project structure\n");

    console.log("Examples:");
    console.log("  orm make:model User");
    console.log("  orm make:migration create_users_table");
    console.log("  orm serve --dev");
    console.log("  orm migrate");
    console.log("  orm seed");
}

// No command → show help
if (!command) {
    showHelp();
    process.exit(0);
}

// ───────────────────────────────────────────
//  EXECUTION
// ───────────────────────────────────────────
switch (command) {

    case "make:model":
        require("../src/cli/makeModel")(name);
        break;

    case "make:controller":
        require("../src/cli/makeController")(name);
        break;

    case "make:migration":
        require("../src/cli/makeMigration")(name);
        break;

    case "make:seed":
        require("../src/cli/makeSeed")(name);
        break;

    case "migrate":
        require("../src/cli/migrate")(false);
        break;

    case "migrate:rollback":
        require("../src/cli/migrate")(true);
        break;

    case "seed":
        require("../src/cli/seed")();
        break;

    case "init":
        require("../src/cli/init")();
        break;

    case "serve":
        // Support: orm serve  or  orm serve --dev
        const dev = args.includes("--dev");
        require("../src/cli/serve")(dev);
        break;

    case "--help":
    case "-h":
    case "help":
        showHelp();
        break;

    default:
        console.log(`Unknown command: ${command}\n`);
        showHelp();
        break;
}
