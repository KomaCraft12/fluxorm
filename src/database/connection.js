const mysql = require("mysql2/promise");

let pool = null;

module.exports = {
    async connect(config) {
        pool = await mysql.createPool(config);
    },

    get() {
        if (!pool) throw new Error("DB connection not initialized!");
        return pool;
    }
};
