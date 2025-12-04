const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../database/connection");
const cookieParser = require("cookie-parser");
// REGISTER MIDDLEWARES
const MiddlewareRegistry = require("./MiddlewareRegistry");
const auth = require(process.cwd() + "/middleware/auth");


class Server {

    // ───────────────────────────────────────────
    //  START SERVER
    // ───────────────────────────────────────────
    async start() {
        try {
            console.log("⚡ Connecting to database...");

            await db.connect({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
            });

            console.log("✔ Database connected");

            // Express app instance
            this.app = express();
            this.app.use(express.json());
            this.app.use(cookieParser());

            // ↓↓↓ Load & Apply Kernel ↓↓↓
            this.kernel = this.loadKernel();
            this.applyKernel();

            // middleware regisztráció
            MiddlewareRegistry.register("auth.token", auth.token);
            MiddlewareRegistry.register("auth.cookie", auth.cookie);

            // ↓↓↓ Load user routes ↓↓↓
            this.router = this.loadRoutes();
            this.app.use("/api", this.router);

            // ↓↓↓ Error handler ALWAYS last ↓↓↓
            this.app.use(this.errorHandler.bind(this));

            const PORT = process.env.PORT || 3000;

            this.app.listen(PORT, () => {
                console.log("🚀 API running at http://localhost:" + PORT);
            });

        } catch (err) {
            console.error("❌ Server failed to start", err);
            process.exit(1);
        }
    }

    // ───────────────────────────────────────────
    //  LOAD PROJECT KERNEL (app/Kernel.js)
    // ───────────────────────────────────────────
    loadKernel() {
        const kernelPath = path.join(process.cwd(), "app/Kernel.js");

        if (!fs.existsSync(kernelPath)) {
            console.log("❌ Kernel not found at: " + kernelPath);
            throw new Error("Kernel missing. Create app/Kernel.js");
        }

        console.log("🧠 Using project Kernel");
        return require(kernelPath);
    }

    // ───────────────────────────────────────────
    // APPLY PROJECT MIDDLEWARES
    // ───────────────────────────────────────────
    applyKernel() {
        if (typeof this.kernel.apply !== "function") {
            throw new Error("Kernel.apply(app) method missing.");
        }

        this.kernel.apply(this.app);
    }

    // ───────────────────────────────────────────
    //  LOAD PROJECT ROUTES
    // ───────────────────────────────────────────
    loadRoutes() {
        const routesPath = path.join(process.cwd(), "routes/api.js");

        if (!fs.existsSync(routesPath)) {
            console.log("❌ Missing routes/api.js");
            throw new Error("API router missing.");
        }

        console.log("📡 Loading routes...");
        return require(routesPath);
    }

    // ───────────────────────────────────────────
    // GLOBAL ERROR HANDLER  (bindolva!)
    // ───────────────────────────────────────────
    errorHandler(err, req, res, next) {

        if (err.errors) {
            return res.status(422).json({
                message: "Validation error",
                errors: err.errors,
            });
        }

        console.error("🔥 UNHANDLED ERROR:", err);

        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
}

module.exports = new Server();
