module.exports = {
    up: async (db) => {
        await db.query(`
            CREATE TABLE personal_access_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNSIGNED NOT NULL,
                token VARCHAR(64) NOT NULL UNIQUE,
                name VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    },

    down: async (db) => {
        await db.query(`DROP TABLE IF EXISTS personal_access_tokens`);
    }
}