// src/database/Schema.js
class Schema {
    constructor(pool) {
        this.pool = pool;
    }

    // segéd: default érték idézőjelezése/literál kezelése
    static formatDefault(val) {
        if (val === null) return "NULL";
        // ha nyers SQL literál (CURRENT_TIMESTAMP, NOW(), TRUE, FALSE stb.)
        if (typeof val === "string" && /^[A-Z_][A-Z_()0-9\s]*$/.test(val)) return val;
        if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
        if (typeof val === "number") return String(val);
        // egyéb string érték
        return `'${val.replace(/'/g, "''")}'`;
    }

    async createTable(name, callback) {
        const columns = [];
        const constraints = [];

        const table = {
            // --- oszloptípusok egységes láncolással ---
            increments(col) {
                columns.push(`${col} INT AUTO_INCREMENT PRIMARY KEY`);
            },

            integer(col) {
                let def = `${col} INT`;
                const api = {
                    unsigned() { def = `${col} INT UNSIGNED`; return api; },
                    notNullable() { def += " NOT NULL"; return api; },
                    nullable() { def = def.replace(" NOT NULL", ""); return api; },
                    defaultTo(val) { def += ` DEFAULT ${Schema.formatDefault(val)}`; return api; },
                    unique() { def += " UNIQUE"; return api; },
                    build() { columns.push(def); }
                };
                return api;
            },

            string(col, len = 255) {
                let def = `${col} VARCHAR(${len})`;
                const api = {
                    notNullable() { def += " NOT NULL"; return api; },
                    nullable() { def = def.replace(" NOT NULL", ""); return api; },
                    defaultTo(val) { def += ` DEFAULT ${Schema.formatDefault(val)}`; return api; },
                    unique() { def += " UNIQUE"; return api; },
                    build() { columns.push(def); }
                };
                return api;
            },

            text(col) {
                let def = `${col} TEXT`;
                const api = {
                    notNullable() { def += " NOT NULL"; return api; },
                    nullable() { def = def.replace(" NOT NULL", ""); return api; },
                    defaultTo(val) { def += ` DEFAULT ${Schema.formatDefault(val)}`; return api; }, // MySQL: csak bizonyos text default engedélyezett verziótól függően
                    build() { columns.push(def); }
                };
                return api;
            },

            boolean(col) {
                let def = `${col} TINYINT(1)`;
                const api = {
                    notNullable() { def += " NOT NULL"; return api; },
                    nullable() { def = def.replace(" NOT NULL", ""); return api; },
                    defaultTo(val) { def += ` DEFAULT ${Schema.formatDefault(val)}`; return api; },
                    build() { columns.push(def); }
                };
                return api;
            },

            decimal(col, precision = 10, scale = 2) {
                let def = `${col} DECIMAL(${precision},${scale})`;
                const api = {
                    notNullable() { def += " NOT NULL"; return api; },
                    nullable() { def = def.replace(" NOT NULL", ""); return api; },
                    defaultTo(val) { def += ` DEFAULT ${Schema.formatDefault(val)}`; return api; },
                    build() { columns.push(def); }
                };
                return api;
            },

            date(col) {
                let def = `${col} DATE`;
                const api = {
                    notNullable() { def += " NOT NULL"; return api; },
                    nullable() { def = def.replace(" NOT NULL", ""); return api; },
                    defaultTo(val) { def += ` DEFAULT ${Schema.formatDefault(val)}`; return api; },
                    build() { columns.push(def); }
                };
                return api;
            },

            datetime(col) {
                let def = `${col} DATETIME`;
                const api = {
                    notNullable() { def += " NOT NULL"; return api; },
                    nullable() { def = def.replace(" NOT NULL", ""); return api; },
                    defaultTo(val) { def += ` DEFAULT ${Schema.formatDefault(val)}`; return api; },
                    onUpdate(val = "CURRENT_TIMESTAMP") { def += ` ON UPDATE ${Schema.formatDefault(val)}`; return api; },
                    build() { columns.push(def); }
                };
                return api;
            },

            timestamp(col) {
                let def = `${col} TIMESTAMP`;
                const api = {
                    notNullable() { def += " NOT NULL"; return api; },
                    nullable() { def = def.replace(" NOT NULL", ""); return api; },
                    defaultTo(val = "CURRENT_TIMESTAMP") { def += ` DEFAULT ${Schema.formatDefault(val)}`; return api; },
                    onUpdate(val = "CURRENT_TIMESTAMP") { def += ` ON UPDATE ${Schema.formatDefault(val)}`; return api; },
                    build() { columns.push(def); }
                };
                return api;
            },

            // --- táblaszintű kulcsok / indexek ---
            primary(...cols) { constraints.push(`PRIMARY KEY (${cols.join(", ")})`); },
            unique(...cols) { constraints.push(`UNIQUE (${cols.join(", ")})`); },
            index(...cols) { constraints.push(`INDEX (${cols.join(", ")})`); },
            foreign(col, refTable, refCol, opts = {}) {
                let clause = `FOREIGN KEY (${col}) REFERENCES ${refTable}(${refCol})`;
                if (opts.onDelete) clause += ` ON DELETE ${opts.onDelete}`;
                if (opts.onUpdate) clause += ` ON UPDATE ${opts.onUpdate}`;
                constraints.push(clause);
            }
        };

        callback(table);

        const sql = `CREATE TABLE ${name} (${[...columns, ...constraints].join(", ")})`;
        await this.pool.query(sql);
    }

    async dropTable(name) {
        await this.pool.query(`DROP TABLE ${name}`);
    }

    async alterTable(name, callback) {
        const alterations = [];
        const table = {
            addColumn(def) { alterations.push(`ADD COLUMN ${def}`); },
            dropColumn(col) { alterations.push(`DROP COLUMN ${col}`); },
            renameColumn(oldName, newName, typeDef) {
                // MySQL CHANGE szintaxis: CHANGE old new type [attributes]
                if (!typeDef) throw new Error("renameColumn requires typeDef in MySQL (CHANGE old new TYPE ...)");
                alterations.push(`CHANGE ${oldName} ${newName} ${typeDef}`);
            },
            addIndex(...cols) { alterations.push(`ADD INDEX (${cols.join(", ")})`); },
            addUnique(...cols) { alterations.push(`ADD UNIQUE (${cols.join(", ")})`); },
            addForeign(col, refTable, refCol, opts = {}) {
                let clause = `ADD FOREIGN KEY (${col}) REFERENCES ${refTable}(${refCol})`;
                if (opts.onDelete) clause += ` ON DELETE ${opts.onDelete}`;
                if (opts.onUpdate) clause += ` ON UPDATE ${opts.onUpdate}`;
                alterations.push(clause);
            }
        };
        callback(table);
        const sql = `ALTER TABLE ${name} ${alterations.join(", ")}`;
        await this.pool.query(sql);
    }
}

module.exports = Schema;
