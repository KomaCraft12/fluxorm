const { db } = require("../database/connection");

class Validator {

    static async validate(data, rulesObj) {
        const errors = {};

        for (const field in rulesObj) {
            const rules = rulesObj[field].split("|");
            const value = data[field];

            for (const rule of rules) {
                const [name, param] = rule.split(":");

                // 🔥 Dinamikus hívás
                const method = `rule_${name}`;
                if (typeof this[method] === "function") {
                    const error = await this[method](field, value, param, data);
                    if (error) {
                        if (!errors[field]) errors[field] = [];
                        errors[field].push(error);
                    }
                }
            }
        }

        // Ha vannak hibák → dobjuk
        if (Object.keys(errors).length > 0) {
            const err = new Error("Validation error");
            err.errors = errors;
            throw err;
        }

        return true;
    }

    // ─────────────────────────────────────────────
    //  RULES
    // ─────────────────────────────────────────────

    static rule_required(field, value) {
        if (value === undefined || value === null || value === "") {
            return `${field} is required`;
        }
    }

    static rule_string(field, value) {
        if (value !== undefined && typeof value !== "string") {
            return `${field} must be a string`;
        }
    }

    static rule_numeric(field, value) {
        if (value !== undefined && isNaN(value)) {
            return `${field} must be numeric`;
        }
    }

    static rule_email(field, value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            return `${field} must be a valid email`;
        }
    }

    static rule_boolean(field, value) {
        if (value !== undefined && ![true, false, 0, 1, "0", "1"].includes(value)) {
            return `${field} must be boolean`;
        }
    }

    static rule_min(field, value, param) {
        if (value && value.length < Number(param)) {
            return `${field} must be at least ${param} characters`;
        }
    }

    static rule_max(field, value, param) {
        if (value && value.length > Number(param)) {
            return `${field} must be at most ${param} characters`;
        }
    }

    // ─────────────────────────────────────────────
    //  confirmed
    // ─────────────────────────────────────────────
    static rule_confirmed(field, value, _param, data) {
        if (value !== data[`${field}_confirmation`]) {
            return `${field} confirmation does not match`;
        }
    }

    // ─────────────────────────────────────────────
    //  unique:table,column
    // ─────────────────────────────────────────────
    static async rule_unique(field, value, param) {
        if (!value) return;

        const [table, column] = param.split(",");
        const pool = db.get();

        const [rows] = await pool.query(
            `SELECT COUNT(*) as c FROM ${table} WHERE ${column}=?`,
            [value]
        );

        if (rows[0].c > 0) {
            return `${field} must be unique`;
        }
    }

    // ─────────────────────────────────────────────
    //  exists:table,column
    // ─────────────────────────────────────────────
    static async rule_exists(field, value, param) {
        if (!value) return;

        const [table, column] = param.split(",");
        const pool = db.get();

        const [rows] = await pool.query(
            `SELECT COUNT(*) as c FROM ${table} WHERE ${column}=?`,
            [value]
        );

        if (rows[0].c === 0) {
            return `${field} does not exist`;
        }
    }

    // ─────────────────────────────────────────────
    //  date
    // ─────────────────────────────────────────────
    static rule_date(field, value) {
        if (value && isNaN(Date.parse(value))) {
            return `${field} must be a valid date`;
        }
    }

    // ─────────────────────────────────────────────
    //  before:date
    // ─────────────────────────────────────────────
    static rule_before(field, value, param) {
        if (!value) return;
        if (new Date(value) >= new Date(param)) {
            return `${field} must be before ${param}`;
        }
    }

    // ─────────────────────────────────────────────
    //  after:date
    // ─────────────────────────────────────────────
    static rule_after(field, value, param) {
        if (!value) return;
        if (new Date(value) <= new Date(param)) {
            return `${field} must be after ${param}`;
        }
    }
}

module.exports = Validator;
