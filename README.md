![npm version](https://img.shields.io/npm/v/fluxorm.svg)
![npm downloads](https://img.shields.io/npm/dw/fluxorm.svg)
![license](https://img.shields.io/npm/l/fluxorm)
![node](https://img.shields.io/node/v/fluxorm)

---

## 📢 Latest changes (v1.0.4 – 2025-12-05)

- Fixed database connection import: replaced destructuring `{ db }` with `connection.get()` to prevent `undefined` errors in `Model` and `Validator`
- Stabilized `User.save()` and DB‑aware validation rules (`unique`, `exists`) by correctly accessing the pool
- Added **Model.insert(data)** static shortcut for creating and saving new records
- Added **Model.create(data)** alias for `insert()`, providing Laravel‑style API convenience

---

# ⚡ FluxORM  
A powerful modular Node.js backend framework — ORM + Query Builder + Router + Kernel + Validator + Express API server.

FluxORM = **Laravel feeling + Express speed + ultra-clean architecture**.

---

## 🚀 Features

### 🔹 ORM + Query Builder
- Model based ORM
- Eager loading: `with()`, nested: `posts.comments`
- Relációk:
  - hasOne
  - hasMany
  - belongsTo
  - belongsToMany
- Query Builder functions:
  - where, orWhere, whereIn, whereNull, whereBetween
  - orderBy, limit, offset
  - raw, whereRaw, joinRaw, havingRaw
- Model opcions:
  - save()
  - delete()
  - find()
  - first()

---

## 🔹 Router – Laravel style
- router.get(), post(), put(), delete()
- router.controller("users", Controller)
- Route group prefix + middleware:
```js
router.group({ prefix: "admin", middleware: ["token"] }, r => {
    r.controller("users", UserController);
});
```

---

## 🔹 Middleware Kernel
Glabol middleware management:

```
app/Kernel.js
```

```js
const cors = require("../middleware/cors");

class Kernel {
    static middleware() {
        return [
            cors
        ];
    }
}

module.exports = Kernel;
```

---

## 🔹 Auth Middleware
Token or Cookie based authentication:

- auth.token → Bearer token
- auth.cookie → Cookie token

```js
router.group({ prefix: "admin", middleware: ["token"] }, r => {
    r.get("/me", (req, res) => res.json(req.user));
});
```

---

## 🔹 Validator – Laravel-style
Supported rules:
- required
- email
- min, max
- integer, boolean
- confirmed
- unique:users,email
- exists:roles,id
- date, before, after

Use:
```js
await Validator.validate(req.body, {
    email: "required|email|unique:users,email",
    password: "required|min:6|confirmed",
});
```

---

## 🔹 CLI Commands

```
orm init                 # projekt skeleton
orm serve                # API run
orm serve --dev          # nodemon dev mode
orm make:model User
orm make:controller UserController
orm make:migration create_users_table
orm make:seed UserSeed
orm migrate
orm migrate:rollback
orm seed
```

---

# 📁 Project Structure

```
/project
│
├── app/
│   └── Kernel.js
│
├── models/
├── controllers/
├── routes/
│   └── api.js
│
├── middleware/
│   ├── cors.js
│   └── auth.js
│
├── migrations/
├── seeders/
├── orm/
│   └── config.js
│
├── index.js
└── .env
```

---

# 🛠 Examples

## 1️⃣ Model
```js
const { Model } = require("querybuilder");

class User extends Model {
    static get table() { return "users"; }

    posts() {
        return this.hasMany(Post, "user_id");
    }
}

module.exports = User;
```

---

## 2️⃣ Controller
```js
const User = require("../models/User");

class UserController {
    static async index(req, res) {
        const users = await User.with("posts").get();
        res.json(users);
    }

    static async show(req, res) {
        const user = await User.find(req.params.id);
        if (!user) return res.status(404).json({ message: "Not found" });
        res.json(user);
    }
}

module.exports = UserController;
```

---

## 3️⃣ Routes
```js
const { Router } = require("querybuilder");
const UserController = require("../controllers/UserController");

const router = new Router();

router.controller("users", UserController);

router.group({ prefix: "admin", middleware: ["token"] }, r => {
    r.controller("users", UserController);
});

router.get("/", (req, res) => res.json({ api: "FluxORM running 🚀" }));

module.exports = router.build();
```

---

## 4️⃣ Migrations
```js
module.exports = {
  up: async (db) => {
    await db.schema.createTable("users", table => {
      table.increments("id");
      table.string("name").notNullable().build();
      table.boolean("active").defaultTo(true);
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  },

  down: async (db) => {
    await db.schema.dropTableIfExists("users");
  }
};
```

# 🚀 Start API

```
orm serve
```

In dev mode:

```
orm serve --dev
```

---

# ⚙️ .env

```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=test
PORT=3000
```

---

# 📦 Migrations

```
orm make:migration create_users_table
orm migrate
```

# 🌱 Seeding

```
orm make:seed UserSeed
orm seed
```

---

# ❤️ Made by Janó  
FluxORM official framework.