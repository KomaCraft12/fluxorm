const fs = require("fs");
const path = require("path");

module.exports = function(name) {
    const timestamp = Date.now();
    const filename = `${timestamp}_${name}.js`;

    const content = `
module.exports = {
    up: async (db) => {
        // CREATE TABLE
    },

    down: async (db) => {
        // DROP TABLE
    }
}
`;

    const filePath = path.join(process.cwd(), "migrations", filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content.trim());

    console.log("Migration created:", `migrations/${filename}`);
};
