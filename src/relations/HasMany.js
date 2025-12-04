const BaseRelation = require("./BaseRelation");

class HasMany extends BaseRelation {
    constructor(parent, related, foreignKey, localKey) {
        super(parent, related, foreignKey, localKey);
    }
}

module.exports = HasMany;
