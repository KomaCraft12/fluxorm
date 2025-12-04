const fs = require("fs");
const path = require("path");
const db = require("../database/connection");

module.exports = async function(rollback = false) {

    // 1. ENV-ből töltjük a DB adatokat
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    };

    if (!config.host) {
        console.error("❌ Missing DB_* variables in .env");
        process.exit(1);
    }

    // 2. DB kapcsolat
    await db.connect(config);

    // 3. Migration futtatás
    const folder = path.join(process.cwd(), "migrations");
    const files = fs.readdirSync(folder);

    for (const file of files) {
        console.log((rollback ? "Rollback: " : "Running: ") + file);
        const migration = require(path.join(folder, file));

        if (!rollback) {
            await migration.up(db.get());
        } else {
            await migration.down(db.get());
        }
    }

    console.log("✔ Migration completed.");
};
