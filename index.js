// fluxorm / index.js
// MINDEN export innen érhető el a user projektben

module.exports = {
    // --- ORM core ---
    QueryBuilder: require("./src/QueryBuilder"),
    Model: require("./src/Model"),
    relations: require("./src/relations"),
    db: require("./src/database/connection"),

    // --- Utilities ---
    utils: require("./src/utils/helpers"),
    Validator: require("./src/utils/Validator"),

    // --- HTTP Kernel & Routing ---
    Router: require("./src/server/Router"),
    MiddlewareRegistry: require("./src/server/MiddlewareRegistry"),
    Server: require("./src/server/Server"),

    // --- Auth & Tokens ---
    TokenManager: require("./src/system/TokenManager"),
    TokenModel: require("./src/system/TokenModel")

};
