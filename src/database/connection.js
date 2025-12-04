// src/database/connection.js
const mysql = require("mysql2/promise");
const Schema = require("./schema");

let pool = null;

module.exports = {
  async connect(config) {
    pool = await mysql.createPool(config);
    this.schema = new Schema(pool); // itt hozzárendeled
    this.fn = {
        now: () => "CURRENT_TIMESTAMP"
    }
  },

  get() {
    if (!pool) throw new Error("DB connection not initialized!");
    return pool;
  }
};
