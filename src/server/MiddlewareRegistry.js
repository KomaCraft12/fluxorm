class MiddlewareRegistry {
    static list = {};

    static register(name, handler) {
        this.list[name] = handler;
    }

    static get(name) {
        return this.list[name];
    }
}

module.exports = MiddlewareRegistry;
