const Model = require("../Model");

class Token extends Model {
    static table = "personal_access_tokens";
}

module.exports = Token;
