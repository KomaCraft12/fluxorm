const BaseRelation = require("./BaseRelation");

class BelongsTo extends BaseRelation {
    constructor(parent, related, foreignKey, ownerKey = "id") {
        super(parent, related, foreignKey, ownerKey);
    }
}

module.exports = BelongsTo;
