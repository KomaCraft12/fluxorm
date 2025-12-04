const db = require("./database/connection");

class QueryBuilder {

    constructor(table) {
        this.table = table;
        this._select = ["*"];
        this._where = [];
        this._order = [];
        this._limit = null;
        this._offset = null;

        this._joins = [];
        this._groupBy = [];
        this._having = [];

        this._rawSelect = [];
        this._rawWhere = [];
        this._rawJoin = [];
        this._rawHaving = [];

        this._with = [];
        this._boundRows = null;
        this.modelClass = null;
    }

    // ─────────────────────────────────────────────
    // SELECT
    // ─────────────────────────────────────────────
    select(...fields) {
        if (fields.length) this._select = fields;
        return this;
    }

    raw(sql) {
        this._rawSelect.push(sql);
        return this;
    }


    // ─────────────────────────────────────────────
    // WHERE API (FULL)
    // ─────────────────────────────────────────────
    where(field, operator, value) {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }
        return this._addWhere("AND", field, operator, value);
    }

    orWhere(field, operator, value) {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }
        return this._addWhere("OR", field, operator, value);
    }

    // IN
    whereIn(field, values) {
        return this._addWhere("AND", field, "IN", values);
    }
    orWhereIn(field, values) {
        return this._addWhere("OR", field, "IN", values);
    }

    // NOT IN
    whereNotIn(field, values) {
        return this._addWhere("AND", field, "NOT IN", values);
    }
    orWhereNotIn(field, values) {
        return this._addWhere("OR", field, "NOT IN", values);
    }

    // NULL
    whereNull(field) {
        return this._addWhere("AND", field, "IS NULL");
    }
    orWhereNull(field) {
        return this._addWhere("OR", field, "IS NULL");
    }

    whereNotNull(field) {
        return this._addWhere("AND", field, "IS NOT NULL");
    }
    orWhereNotNull(field) {
        return this._addWhere("OR", field, "IS NOT NULL");
    }

    // BETWEEN
    whereBetween(field, range) {
        return this._addWhere("AND", field, "BETWEEN", range);
    }
    orWhereBetween(field, range) {
        return this._addWhere("OR", field, "BETWEEN", range);
    }

    // NOT BETWEEN
    whereNotBetween(field, range) {
        return this._addWhere("AND", field, "NOT BETWEEN", range);
    }
    orWhereNotBetween(field, range) {
        return this._addWhere("OR", field, "NOT BETWEEN", range);
    }

    whereRaw(sql, params = []) {
        this._rawWhere.push({ sql, params, type: "AND" });
        return this;
    }

    orWhereRaw(sql, params = []) {
        this._rawWhere.push({ sql, params, type: "OR" });
        return this;
    }

    // INTERNAL WHERE BUILDER
    _addWhere(type, field, operator, value = null) {
        this._where.push({ type, field, operator, value });
        return this;
    }

    // ─────────────────────────────────────────────
    // ORDER BY / LIMIT / OFFSET
    // ─────────────────────────────────────────────
    orderBy(field, direction = "ASC") {
        this._order.push({ field, direction });
        return this;
    }

    limit(n) {
        this._limit = n;
        return this;
    }

    offset(n) {
        this._offset = n;
        return this;
    }

    // ────────────────────────────────────────────
    // JOIN OPERATIONS
    // ─────────────────────────────────────────────
    join(table, left, right) {
        this._joins.push({ type: "JOIN", table, left, right });
        return this;
    }

    leftJoin(table, left, right) {
        this._joins.push({ type: "LEFT JOIN", table, left, right });
        return this;
    }

    rightJoin(table, left, right) {
        this._joins.push({ type: "RIGHT JOIN", table, left, right });
        return this;
    }

    joinRaw(sql) {
        this._rawJoin.push(sql);
        return this;
    }


    // ─────────────────────────────────────────────
    // GROUP BY / HAVING
    // ─────────────────────────────────────────────
    groupBy(...fields) {
        this._groupBy.push(...fields);
        return this;
    }

    having(field, operator, value) {
        this._having.push({ field, operator, value });
        return this;
    }

    orHaving(field, operator, value) {
        this._having.push({ field, operator, value, type: "OR" });
        return this;
    }

    havingRaw(sql, params = []) {
        this._rawHaving.push({ sql, params, type: "AND" });
        return this;
    }

    orHavingRaw(sql, params = []) {
        this._rawHaving.push({ sql, params, type: "OR" });
        return this;
    }

    // ─────────────────────────────────────────────
    // WITH / NESTED EAGER
    // ─────────────────────────────────────────────
    with(rel) {
        if (Array.isArray(rel)) {
            rel.forEach(r => this.with(r));
            return this;
        }

        if (typeof rel === "object") {
            for (const key in rel) {
                this._with.push({ name: key, callback: rel[key] });
            }
            return this;
        }

        if (typeof rel === "string") {
            const parts = rel.split(".");
            this._with.push({ name: parts[0], nested: parts.slice(1).join(".") });
            return this;
        }

        return this;
    }

    bindTo(rows) {
        this._boundRows = rows;
        return this;
    }

    // ─────────────────────────────────────────────
    // BASE QUERY BUILDER (WHERE + ORDER + LIMIT)
    // ─────────────────────────────────────────────
    async runBaseQuery() {
        const pool = db.get();

        let selectParts = [...this._select];

        if (this._rawSelect.length) {
            selectParts.push(...this._rawSelect);
        }

        let sql = `SELECT ${selectParts.join(", ")} FROM ${this.table}`;

        let params = [];

        // WHERE
        if (this._where.length) {
            let clauses = [];

            for (let i = 0; i < this._where.length; i++) {
                const w = this._where[i];
                const prefix = i === 0 ? "WHERE" : w.type;

                if (w.operator === "IN" || w.operator === "NOT IN") {
                    clauses.push(
                        `${prefix} ${w.field} ${w.operator} (${w.value.map(() => "?").join(",")})`
                    );
                    params.push(...w.value);
                }

                else if (w.operator === "BETWEEN" || w.operator === "NOT BETWEEN") {
                    clauses.push(
                        `${prefix} ${w.field} ${w.operator} ? AND ?`
                    );
                    params.push(w.value[0], w.value[1]);
                }

                else if (w.operator === "IS NULL" || w.operator === "IS NOT NULL") {
                    clauses.push(`${prefix} ${w.field} ${w.operator}`);
                }

                else {
                    clauses.push(`${prefix} ${w.field} ${w.operator} ?`);
                    params.push(w.value);
                }
            }

            sql += " " + clauses.join(" ");
        }

        // RAW WHERE
        if (this._rawWhere.length) {
            this._rawWhere.forEach((w, i) => {
                const prefix = i === 0 && !this._where.length ? "WHERE" : w.type;
                sql += ` ${prefix} ${w.sql}`;
                params.push(...w.params);
            });
        }

        // JOINS
        if (this._joins.length) {
            this._joins.forEach(j => {
                sql += ` ${j.type} ${j.table} ON ${j.left} = ${j.right}`;
            });
        }

        // RAW JOIN
        if (this._rawJoin.length) {
            this._rawJoin.forEach(j => sql += " " + j);
        }

        // GROUP BY
        if (this._groupBy.length) {
            sql += " GROUP BY " + this._groupBy.join(", ");
        }

        // HAVING
        if (this._having.length) {

            let havingSql = [];
            let havingParams = [];

            for (let i = 0; i < this._having.length; i++) {
                const h = this._having[i];
                const prefix = i === 0 ? "HAVING" : (h.type === "OR" ? "OR" : "AND");

                havingSql.push(`${prefix} ${h.field} ${h.operator} ?`);
                havingParams.push(h.value);
            }

            sql += " " + havingSql.join(" ");
            params.push(...havingParams);
        }

        // RAW HAVING
        if (this._rawHaving.length) {
            this._rawHaving.forEach((h, i) => {
                const prefix =
                    i === 0 && !this._having.length ? "HAVING" : h.type;

                sql += ` ${prefix} ${h.sql}`;
                params.push(...h.params);
            });
        }

        // ORDER
        if (this._order.length) {
            sql += " ORDER BY " +
                this._order.map(o => `${o.field} ${o.direction}`).join(", ");
        }

        // LIMIT
        if (this._limit !== null) {
            sql += " LIMIT " + this._limit;
        }

        // OFFSET
        if (this._offset !== null) {
            sql += " OFFSET " + this._offset;
        }

        const [rows] = await pool.query(sql, params);

        return rows.map(r => new this.modelClass(r));
    }

    // ─────────────────────────────────────────────
    // GET / FIRST / EAGER PROCESS
    // ─────────────────────────────────────────────
    async get() {
        const rows = await this.runBaseQuery();
        for (const rel of this._with) {
            await this.loadRelation(rel, rows);
        }
        return rows;
    }

    async first() {
        const rows = await this.get();
        return rows[0] || null;
    }

    async eagerProcess() {
        if (!this._boundRows) return;
        for (const rel of this._with) {
            await this.loadRelation(rel, this._boundRows);
        }
    }

    // ─────────────────────────────────────────────
    // EAGER LOADING RELATIONS
    // ─────────────────────────────────────────────
    async loadRelation(relation, rows) {

        const pool = db.get();
        const modelInstance = new this.modelClass();
        const relationFn = modelInstance[relation.name];

        if (!relationFn) return;

        const rel = relationFn.call(modelInstance);
        const RelatedModel = rel.related;

        const type = rel.constructor.name;
        const foreignKey = rel.foreignKey;
        const localKey = rel.localKey;

        let relatedQuery = RelatedModel.query();
        if (relation.callback) relation.callback(relatedQuery);

        // ─────────────────────────────────────────
        // HAS MANY
        // ─────────────────────────────────────────
        if (type === "HasMany") {
            const parentIds = rows.map(r => r[localKey]);

            relatedQuery.where(foreignKey, "IN", parentIds);

            const relatedRows = await relatedQuery.get();

            const grouped = {};
            relatedRows.forEach(r => {
                const key = r[foreignKey];
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(r);
            });

            rows.forEach(r => {
                r[relation.name] = grouped[r[localKey]] || [];
            });

            if (relation.nested) {
                for (const r of rows) {
                    await RelatedModel
                        .query()
                        .with(relation.nested)
                        .bindTo(r[relation.name])
                        .eagerProcess();
                }
            }
        }

        // ─────────────────────────────────────────
        // HAS ONE
        // ─────────────────────────────────────────
        if (type === "HasOne") {
            const parentIds = rows.map(r => r[localKey]);

            relatedQuery.where(foreignKey, "IN", parentIds);

            const relatedRows = await relatedQuery.get();
            const grouped = {};

            relatedRows.forEach(r => grouped[r[foreignKey]] = r);

            rows.forEach(r => {
                r[relation.name] = grouped[r[localKey]] || null;
            });

            if (relation.nested) {
                for (const r of rows) {
                    if (!r[relation.name]) continue;
                    await RelatedModel
                        .query()
                        .with(relation.nested)
                        .bindTo([r[relation.name]])
                        .eagerProcess();
                }
            }
        }

        // ─────────────────────────────────────────
        // BELONGS TO
        // ─────────────────────────────────────────
        if (type === "BelongsTo") {
            const foreignIds = rows.map(r => r[foreignKey]);

            relatedQuery.where(localKey, "IN", foreignIds);

            const relatedRows = await relatedQuery.get();
            const grouped = {};

            relatedRows.forEach(r => grouped[r[localKey]] = r);

            rows.forEach(r => {
                r[relation.name] = grouped[r[foreignKey]] || null;
            });

            if (relation.nested) {
                for (const r of rows) {
                    if (!r[relation.name]) continue;
                    await RelatedModel
                        .query()
                        .with(relation.nested)
                        .bindTo([r[relation.name]])
                        .eagerProcess();
                }
            }
        }

        // ─────────────────────────────────────────
        // BELONGS TO MANY
        // ─────────────────────────────────────────
        if (type === "BelongsToMany") {

            const pivot = rel.pivotTable;
            const parentIds = rows.map(r => r[localKey]);

            const [pivotRows] = await pool.query(
                `SELECT * FROM ${pivot} WHERE ${foreignKey} IN (?)`,
                [parentIds]
            );

            if (pivotRows.length === 0) {
                rows.forEach(r => r[relation.name] = []);
                return;
            }

            const relatedIds = pivotRows.map(p => p[rel.localKey]);

            relatedQuery.where(
                RelatedModel.primaryKey || "id",
                "IN",
                relatedIds
            );

            const relatedRows = await relatedQuery.get();

            const relById = {};
            relatedRows.forEach(r => relById[r.id] = r);

            const grouped = {};
            pivotRows.forEach(p => {
                const pid = p[foreignKey];
                const rid = p[rel.localKey];

                if (!grouped[pid]) grouped[pid] = [];
                grouped[pid].push({
                    ...relById[rid],
                    pivot: p
                });
            });

            rows.forEach(r => {
                r[relation.name] = grouped[r[localKey]] || [];
            });

            if (relation.nested) {
                for (const r of rows) {
                    await RelatedModel
                        .query()
                        .with(relation.nested)
                        .bindTo(r[relation.name])
                        .eagerProcess();
                }
            }
        }
    }
}

module.exports = QueryBuilder;