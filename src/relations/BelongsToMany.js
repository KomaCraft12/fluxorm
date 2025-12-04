const BaseRelation = require("./BaseRelation");

class BelongsToMany extends BaseRelation {
    constructor(parent, related, pivotTable, foreignKey, relatedKey) {
        super(parent, related, foreignKey, relatedKey);
        this.pivotTable = pivotTable;  // pivot table neve
    }
}

module.exports = BelongsToMany;
