const BaseRelation = require("./BaseRelation");

class HasOne extends BaseRelation {
    constructor(parent, related, foreignKey, localKey) {
        super(parent, related, foreignKey, localKey);
    }
}

module.exports = HasOne;
