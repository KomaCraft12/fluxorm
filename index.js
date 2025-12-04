module.exports = {
    QueryBuilder: require("./src/QueryBuilder"),
    Model: require("./src/Model"),
    relations: require("./src/relations"),
    db: require("./src/database/connection"),
    utils: require("./src/utils/helpers"),

    // Server & Router rendszer
    Router: require("./src/server/Router"),
    MiddlewareRegistry: require("./src/server/MiddlewareRegistry"),
    Server: require("./src/server/Server"),

    // Validator
    Validator: require("./src/utils/Validator"),
};
