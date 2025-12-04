const fs = require("fs");
const path = require("path");

module.exports = function(name) {
    const content = `
const { Model } = require("fluxorm");

class ${name} extends Model {
    static get table() {
        return "${name.toLowerCase()}s";
    }
}

module.exports = ${name};
`;

    const filePath = path.join(process.cwd(), "models", `${name}.js`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content.trim());

    console.log(`Model created: models/${name}.js`);
};
