class BaseRelation {
    constructor(parent, related, foreignKey, localKey) {
        this.parent = parent;           // parent model class (User)
        this.related = related;         // related model class (Post)
        this.foreignKey = foreignKey;   // posts.user_id
        this.localKey = localKey;       // users.id
    }
}

module.exports = BaseRelation;
