const express = require("express");
const MiddlewareRegistry = require("../server/MiddlewareRegistry");

class Router {
    constructor(prefix = "") {
        this.router = express.Router();
        this.middlewares = [];
        this.prefix = prefix; // öröklődő prefix
    }

    // ─────────────────────────────────────────────
    //   MIDDLEWARE TÁMOGATÁS
    // ─────────────────────────────────────────────
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }

    // ─────────────────────────────────────────────
    //   SEGÉD: middleware + handler összefűzése
    // ─────────────────────────────────────────────
    wrap(handler) {
        return [...this.middlewares, handler];
    }

    // ─────────────────────────────────────────────
    //   GET / POST / PUT / DELETE
    // ─────────────────────────────────────────────
    get(path, handler) {
        this.router.get(this.prefix + path, this.wrap(handler));
        return this;
    }

    post(path, handler) {
        this.router.post(this.prefix + path, this.wrap(handler));
        return this;
    }

    put(path, handler) {
        this.router.put(this.prefix + path, this.wrap(handler));
        return this;
    }

    delete(path, handler) {
        this.router.delete(this.prefix + path, this.wrap(handler));
        return this;
    }

    // ─────────────────────────────────────────────
    //   RESOURCE ROUTE (Laravel-szerű)
    // ─────────────────────────────────────────────
    resource(path, Controller) {
        const base = path;
        this.get(base, Controller.index);
        this.post(base, Controller.store);
        this.get(base + "/:id", Controller.show);
        this.put(base + "/:id", Controller.update);
        this.delete(base + "/:id", Controller.delete);
        return this;
    }

    // ─────────────────────────────────────────────
    //   GROUPS (prefix + middleware támogatás)
    // ─────────────────────────────────────────────
    group(options, callback) {
        let prefix = "";
        let middlewareList = [];

        // 1️⃣ Csak prefix string?
        if (typeof options === "string") {
            prefix = options;
        }
        // 2️⃣ Objektum formátum? { prefix, middleware }
        else if (typeof options === "object") {
            prefix = options.prefix || "";
            middlewareList = options.middleware || [];
        }

        // új prefix = parent prefix + saját prefix
        const newPrefix = this.prefix + "/" + prefix;

        // Új al-router
        const sub = new Router(newPrefix);

        // öröklődik a parent middleware
        sub.middlewares = [...this.middlewares];

        // string-alapú middleware-ek (Laravel-szerű)
        // string-alapú middleware-ek (Laravel-szerű)
        middlewareList.forEach(name => {
            const mw = MiddlewareRegistry.get(name); // <-- FIX
            if (!mw) throw new Error("Middleware not found: " + name);
            sub.use(mw);
        });


        callback(sub);

        // csatlakoztatjuk az alroutert
        this.router.use(sub.build());
        return this;
    }

    // ─────────────────────────────────────────────
    //   CONTROLLER AUTO-MAP
    // ─────────────────────────────────────────────
    controller(basePath, Controller) {
        const base = basePath;

        if (Controller.index)
            this.get(base, Controller.index);

        if (Controller.show)
            this.get(base + "/:id", Controller.show);

        if (Controller.store)
            this.post(base, Controller.store);

        if (Controller.update)
            this.put(base + "/:id", Controller.update);

        if (Controller.delete)
            this.delete(base + "/:id", Controller.delete);

        return this;
    }

    // ─────────────────────────────────────────────
    //   VÉGLEGES EXPRESS ROUTER
    // ─────────────────────────────────────────────
    build() {
        return this.router;
    }
}

module.exports = Router;
