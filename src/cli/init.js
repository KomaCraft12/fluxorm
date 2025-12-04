const fs = require("fs");
const path = require("path");

module.exports = function () {
    console.log("\n🚀 Initializing KOMA ORM project...\n");

    const root = process.cwd();

    const dirs = [
        "models",
        "controllers",
        "routes",
        "middleware",
        "app",
        "migrations",
        "seeders",
        "orm"
    ];

    // ─────────────────────────────────────────────
    // Create directories
    // ─────────────────────────────────────────────
    dirs.forEach(dir => {
        const p = path.join(root, dir);
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p, { recursive: true });
            console.log(`  ✔ Created folder: ${dir}`);
        } else {
            console.log(`  ▸ Exists: ${dir}`);
        }
    });

    // ─────────────────────────────────────────────
    // .env
    // ─────────────────────────────────────────────
    const envPath = path.join(root, ".env");
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(
            envPath,
            `DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=test
PORT=3000`
        );
        console.log("  ✔ Created: .env");
    }

    // ─────────────────────────────────────────────
    // orm/config.js
    // ─────────────────────────────────────────────
    const configPath = path.join(root, "orm/config.js");
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(
            configPath,
            `module.exports = {
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }
};`
        );
        console.log("  ✔ Created: orm/config.js");
    }

    // ─────────────────────────────────────────────
    // routes/api.js
    // ─────────────────────────────────────────────
    const routesFile = path.join(root, "routes/api.js");
    if (!fs.existsSync(routesFile)) {
        fs.writeFileSync(
            routesFile,
            `const { Router } = require("querybuilder");

const router = new Router();

router.get("/", (req, res) => {
    res.json({ message: "API is working 🚀" });
});

// Példa auth group
router.group({ prefix: "auth", middleware: ["auth.token"] }, r => {
    r.get("/me", (req, res) => {
        res.json({ user: req.user });
    });
});

module.exports = router.build();
`
        );
        console.log("  ✔ Created: routes/api.js");
    }

    // ─────────────────────────────────────────────
    // middleware/cors.js
    // ─────────────────────────────────────────────
    const corsFile = path.join(root, "middleware/cors.js");
    if (!fs.existsSync(corsFile)) {
        fs.writeFileSync(
            corsFile,
            `module.exports = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
};`
        );
        console.log("  ✔ Created: middleware/cors.js");
    }

    // ─────────────────────────────────────────────
    // middleware/auth.js
    // ─────────────────────────────────────────────
    const authFile = path.join(root, "middleware/auth.js");
    if (!fs.existsSync(authFile)) {
        fs.writeFileSync(
            authFile,
            `module.exports = {

    token: async (req, res, next) => {
        try {
            const header = req.headers.authorization;

            if (!header || !header.startsWith("Bearer "))
                return res.status(401).json({ message: "Missing or invalid token" });

            const token = header.split(" ")[1];

            // ❗ LAZY LOAD HERE → elkerüli a ciklikus require-t
            const User = require(process.cwd() + "/models/User");

            const user = await User.where("api_token", token).first();
            if (!user)
                return res.status(401).json({ message: "Invalid token" });

            req.user = user;
            next();

        } catch (err) {
            console.error("auth.token error:", err);
            res.status(500).json({ message: "Auth error" });
        }
    },


    cookie: async (req, res, next) => {
        try {
            const token = req.cookies?.auth_token;

            if (!token)
                return res.status(401).json({ message: "Missing auth cookie" });

            // ❗ LAZY LOAD HERE ALSO
            const User = require(process.cwd() + "/models/User");

            const user = await User.where("api_token", token).first();
            if (!user)
                return res.status(401).json({ message: "Invalid auth cookie" });

            req.user = user;
            next();

        } catch (err) {
            console.error("auth.cookie error:", err);
            res.status(500).json({ message: "Auth error" });
        }
    }

};`
        );
        console.log("  ✔ Created: middleware/auth.js");
    }

    // ─────────────────────────────────────────────
    // app/Kernel.js
    // ─────────────────────────────────────────────
    const kernelFile = path.join(root, "app/Kernel.js");
    if (!fs.existsSync(kernelFile)) {
        fs.writeFileSync(
            kernelFile,
            `const cors = require("../middleware/cors");
const auth = require("../middleware/auth");

class Kernel {
    static middleware() {
        return [
            cors
            // később: rateLimit, throttle, logging, session...
        ];
    }

    static routeMiddleware() {
        return {
            "auth.token": auth.token,
            "auth.cookie": auth.cookie
        };
    }
}

module.exports = Kernel;`
        );
        console.log("  ✔ Created: app/Kernel.js");
    }

    // ─────────────────────────────────────────────
    // index.js → only calls server.start()
    // ─────────────────────────────────────────────
    const indexFile = path.join(root, "index.js");
    if (!fs.existsSync(indexFile)) {
        fs.writeFileSync(
            indexFile,
            `const { server } = require("querybuilder");
server.start();`
        );
        console.log("  ✔ Created: index.js");
    }

    // README.md
    const readme = path.join(root, "README.md");
    if (!fs.existsSync(readme)) {
        fs.writeFileSync(readme, "# KOMA ORM Project\nGenerated by \`orm init\`.");
        console.log("  ✔ Created: README.md");
    }

    console.log("\n✨ Project initialized!\n");
};
