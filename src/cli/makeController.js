const fs = require("fs");
const path = require("path");

module.exports = function (name) {
    if (!name) {
        console.log("Controller name missing. Example: orm make:controller UserController");
        return;
    }

    const className = name.replace(".js", "");
    const fileName = className + ".js";
    const folder = path.join(process.cwd(), "controllers");

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const file = path.join(folder, fileName);

    if (fs.existsSync(file)) {
        console.log(`Controller already exists: ${fileName}`);
        return;
    }

    // ───────────────────────────────────────
    //  VÉGLEGES SABLON – statikus metódusokkal
    // ───────────────────────────────────────
    const template = `
class ${className} {

    // GET /resource
    static async index(req, res) {
        return res.json({ message: "${className} index()" });
    }

    // GET /resource/:id
    static async show(req, res) {
        return res.json({ message: "${className} show()", id: req.params.id });
    }

    // POST /resource
    static async store(req, res) {
        return res.json({ message: "${className} store()", body: req.body });
    }

    // PUT /resource/:id
    static async update(req, res) {
        return res.json({ message: "${className} update()", id: req.params.id });
    }

    // DELETE /resource/:id
    static async delete(req, res) {
        return res.json({ message: "${className} delete()", id: req.params.id });
    }
}

module.exports = ${className};
`;

    fs.writeFileSync(file, template.trim());
    console.log(`✔ Created controller: ${fileName}`);
};
