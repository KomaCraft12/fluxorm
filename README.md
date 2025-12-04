![npm version](https://img.shields.io/npm/v/fluxorm.svg)
![npm downloads](https://img.shields.io/npm/dw/fluxorm.svg)
![license](https://img.shields.io/npm/l/fluxorm)
![node](https://img.shields.io/node/v/fluxorm)

# ⚡ FluxORM  
A powerful modular Node.js backend framework — ORM + Query Builder + Router + Kernel + Validator + Express API server.

FluxORM = **Laravel feeling + Express speed + ultra-clean architecture**.

---

## 🚀 Features

### 🔹 ORM + Query Builder
- Model alapú ORM
- Eager loading: `with()`, nested: `posts.comments`
- Relációk:
  - hasOne
  - hasMany
  - belongsTo
  - belongsToMany
- Query Builder funkciók:
  - where, orWhere, whereIn, whereNull, whereBetween
  - orderBy, limit, offset
  - raw, whereRaw, joinRaw, havingRaw
- Model opciók:
  - save()
  - delete()
  - find()
  - first()

---

## 🔹 Router – Laravel stílus
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
Globális middleware kezelés:

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
Token vagy Cookie alapú autentikáció:

- auth.token → Bearer token
- auth.cookie → Cookie token

```js
router.group({ prefix: "admin", middleware: ["token"] }, r => {
    r.get("/me", (req, res) => res.json(req.user));
});
```

---

## 🔹 Validator – Laravel-stílus
Támogatott szabályok:
- required
- email
- min, max
- integer, boolean
- confirmed
- unique:users,email
- exists:roles,id
- date, before, after

Használat:
```js
await Validator.validate(req.body, {
    email: "required|email|unique:users,email",
    password: "required|min:6|confirmed",
});
```

---

## 🔹 CLI Parancsok

```
orm init                 # projekt skeleton
orm serve                # API indítás
orm serve --dev          # nodemon dev mód
orm make:model User
orm make:controller UserController
orm make:migration create_users_table
orm make:seed UserSeed
orm migrate
orm migrate:rollback
orm seed
```

---

# 📁 Projekt Struktúra

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

# 🛠 Példák

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

# 🚀 Start API

```
orm serve
```

Dev módban:

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

