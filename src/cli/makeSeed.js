const fs = require("fs");
const path = require("path");

module.exports = function(name) {

    if (!name) {
        console.error("❌ Seeder name is required. Example: orm make:seed UsersSeeder");
        process.exit(1);
    }

    // projekt gyökér
    const projectRoot = process.cwd();

    // seeders mappa létrehozása, ha nincs
    const seedersDir = path.join(projectRoot, "seeders");
    if (!fs.existsSync(seedersDir)) {
        fs.mkdirSync(seedersDir);
    }

    // fájlnév
    const timestamp = Date.now();
    const fileName = `${timestamp}_${name}.js`;

    const filePath = path.join(seedersDir, fileName);

    const template = `module.exports = {
    async run(db) {
        // TODO: seed logic here
    }
};
`;

    fs.writeFileSync(filePath, template);

    console.log(`✔ Seeder created: seeders/${fileName}`);
};
