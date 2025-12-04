const fs = require("fs");
const path = require("path");

module.exports = function(name) {
    // 1. Timestamp emberi olvasható formátumban
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(0, 14); // YYYYMMDDHHMMSS

    const filename = `${timestamp}_${name}.js`;

    // 2. Migration sablon, tábla névvel
    const content = `module.exports = {
  up: async (db) => {
    await db.schema.createTable("${name}", table => {
      // oszlopok ide
    });
  },

  down: async (db) => {
    await db.schema.dropTableIfExists("${name}");
  }
};
`;

    // 3. Fájl létrehozás
    const folder = path.join(process.cwd(), "migrations");
    fs.mkdirSync(folder, { recursive: true });
    const filePath = path.join(folder, filename);
    fs.writeFileSync(filePath, content, { encoding: "utf8" });

    console.log("✔ Migration created:", path.relative(process.cwd(), filePath));
};
