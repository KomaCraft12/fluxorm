module.exports = {
  up: async (db) => {
    await db.schema.createTable("personal_access_tokens", table => {
      table.increments("id");

      table.integer("user_id")
        .unsigned()
        .notNullable()
        .build();

      table.string("token", 64)
        .notNullable()
        .unique()
        .build();

      table.string("name", 255)
        .nullable()
        .build();

      table.timestamp("created_at")
        .defaultTo("CURRENT_TIMESTAMP")
        .build();
    });
  },

  down: async (db) => {
    await db.schema.dropTable("personal_access_tokens");
  }
};
