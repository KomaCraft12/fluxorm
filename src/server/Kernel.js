// src/server/Kernel.js

// Alap CORS middleware (fallback)
function defaultCors(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
}

class Kernel {
    static middleware() {
        return [
            defaultCors
        ];
    }
}

module.exports = Kernel;
