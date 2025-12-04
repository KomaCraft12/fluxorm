const db = require("../database/connection");

module.exports = async function () {

    // 1. Database config from .env
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    };

    await db.connect(config);

    console.log("🌱 Seeding database...");

    // Betöltjük a projekt "seeders" mappáját
    const fs = require("fs");
    const path = require("path");

    const folder = path.join(process.cwd(), "seeders");

    if (!fs.existsSync(folder)) {
        console.error("❌ Seeder folder not found: seeders/");
        return;
    }

    const files = fs.readdirSync(folder);

    for (const file of files) {
        console.log("Running seeder:", file);
        const seeder = require(path.join(folder, file));

        await seeder.run(db.get());
    }

    console.log("✔ Seeding completed!");
};
