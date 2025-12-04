const QueryBuilder = require("./QueryBuilder");
const { db } = require("./database/connection");
const { HasOne, HasMany, BelongsTo, BelongsToMany } = require("./relations");

class Model {

    // ───────────────────────────
    //  TABLE NAME
    // ───────────────────────────
    static get table() {
        return null;
    }

    // ───────────────────────────
    //  PRIMARY KEY
    // ───────────────────────────
    static get primaryKey() {
        return "id";
    }

    // ───────────────────────────
    //  QUERY BUILDER (INSTANCE)
    // ───────────────────────────
    static query() {
        const builder = new QueryBuilder(this.table);
        builder.modelClass = this;
        return builder;
    }

    // ───────────────────────────
    //  SHORTCUTS
    // ───────────────────────────
    static select(...args) {
        return this.query().select(...args);
    }

    static where(...args) {
        return this.query().where(...args);
    }

    static with(...args) {
        return this.query().with(...args);
    }

    // RAW SHORTCUTS
    static raw(sql) {
        return this.query().raw(sql);
    }

    static whereRaw(sql, params = []) {
        return this.query().whereRaw(sql, params);
    }

    static orWhereRaw(sql, params = []) {
        return this.query().orWhereRaw(sql, params);
    }

    static joinRaw(sql) {
        return this.query().joinRaw(sql);
    }

    static havingRaw(sql, params = []) {
        return this.query().havingRaw(sql, params);
    }

    static orHavingRaw(sql, params = []) {
        return this.query().orHavingRaw(sql, params);
    }

    // ───────────────────────────
    //  FIND / FIRST
    // ───────────────────────────
    static async find(id) {
        return await this.query()
            .where(this.primaryKey, id)
            .first();
    }

    static async first() {
        return await this.query().first();
    }

    async refresh() {
        const fresh = await this.constructor.find(this[this.constructor.primaryKey]);
        return Object.assign(this, fresh);
    }

    // ───────────────────────────
    //  INSTANCE CONSTRUCTOR
    // ───────────────────────────
    constructor(data = {}) {
        Object.assign(this, data);
    }

    // ───────────────────────────
    //  SAVE() (INSERT / UPDATE)
    // ───────────────────────────
    async save() {
        const pool = db.get();
        const pk = this.constructor.primaryKey;

        // UPDATE
        if (this[pk]) {
            const fields = Object.keys(this).filter(k => k !== pk);
            const values = fields.map(f => this[f]);

            const sql = `UPDATE ${this.constructor.table}
                         SET ${fields.map(f => f + "=?").join(",")}
                         WHERE ${pk}=?`;

            await pool.query(sql, [...values, this[pk]]);
            return this;
        }

        // INSERT
        const fields = Object.keys(this);
        const values = fields.map(f => this[f]);

        const sql = `INSERT INTO ${this.constructor.table}
                     (${fields.join(",")})
                     VALUES (${fields.map(() => "?").join(",")})`;

        const [result] = await pool.query(sql, values);

        this[pk] = result.insertId;
        return this;
    }

    // ───────────────────────────
    //  DELETE()
    // ───────────────────────────
    async delete() {
        const pool = db.get();
        const pk = this.constructor.primaryKey;

        const sql = `DELETE FROM ${this.constructor.table}
                     WHERE ${pk}=?`;

        await pool.query(sql, [this[pk]]);
    }

    // ───────────────────────────
    //  RELATIONS (STATIC)
    // ───────────────────────────
    static hasOne(related, foreignKey, localKey = "id") {
        return new HasOne(this, related, foreignKey, localKey);
    }

    static hasMany(related, foreignKey, localKey = "id") {
        return new HasMany(this, related, foreignKey, localKey);
    }

    static belongsTo(related, foreignKey, ownerKey = "id") {
        return new BelongsTo(this, related, foreignKey, ownerKey);
    }

    static belongsToMany(related, pivotTable, foreignKey, relatedKey) {
        return new BelongsToMany(this, related, pivotTable, foreignKey, relatedKey);
    }

    // ───────────────────────────
    //  RELATIONS (INSTANCE)
    // ───────────────────────────
    hasOne(related, foreignKey, localKey = "id") {
        return this.constructor.hasOne(related, foreignKey, localKey);
    }

    hasMany(related, foreignKey, localKey = "id") {
        return this.constructor.hasMany(related, foreignKey, localKey);
    }

    belongsTo(related, foreignKey, ownerKey = "id") {
        return this.constructor.belongsTo(related, foreignKey, ownerKey);
    }

    belongsToMany(related, pivotTable, foreignKey, relatedKey) {
        return this.constructor.belongsToMany(related, pivotTable, foreignKey, relatedKey);
    }
}

module.exports = Model;