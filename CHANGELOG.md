# Changelog
All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](https://semver.org/).

## [1.0.3] - 2025-12-04
### Fixed
- Resolved circular dependency between `TokenManager` and `TokenModel` that caused `TokenManager` to be `undefined` when imported from `fluxorm`.
- Updated `TokenModel` to import `Model` directly (`../Model`) instead of via the main `index.js`, eliminating require loops.
- Stabilized `index.js` exports so `TokenManager` is consistently available through `require("fluxorm")`.
- Improved middleware compatibility: `auth.js` can now safely use `TokenManager.getUserByToken()` without crashing during server startup.

---

## [1.0.2] - 2025-12-04
### Added
- Extended **SchemaBuilder** with chainable methods:
  - `defaultTo()`, `notNullable()`, `nullable()`, `unique()`
  - Support for `decimal`, `date`, `datetime`, `timestamp` with `onUpdate`
- Foreign key constraints with `onDelete` and `onUpdate` options
- `alterTable()` support for adding/dropping/renaming columns, indexes, and foreign keys
- Migrations can now be written fully schema‑based (Knex‑like style)

---

## [1.0.1] - 2025-12-04
### Added
- **Authentication middleware**:
  - `auth.token` and `auth.cookie` support in router groups
- **TokenManager** utility:
  - `generateToken()` for secure random tokens
  - `createForUser()` to assign tokens to users
  - `verify()` to check token validity
  - `getUserByToken()` to resolve user from token
  - `revokeAll()` to delete all tokens for a user

---

## [1.0.0] - 2025-12-04
### Added
- Initial release of **FluxORM** 🎉
- ORM + Query Builder with eager loading and relations (`hasOne`, `hasMany`, `belongsTo`, `belongsToMany`)
- Laravel‑style Router with groups, prefix, and middleware
- Middleware Kernel for global middleware management
- Validator with Laravel‑style rules (`required`, `email`, `unique`, `exists`, `date`, etc.)
- CLI commands: `orm init`, `orm serve`, `orm make:model`, `orm make:controller`, `orm make:migration`, `orm migrate`, `orm seed`
- Project skeleton structure (`app/`, `models/`, `controllers/`, `routes/`, `migrations/`, `seeders/`, etc.)
