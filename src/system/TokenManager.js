// src/auth/TokenManager.js
const Token = require("./TokenModel");
const crypto = require("crypto");

class TokenManager {

    // -------------------------------------------------------
    // Token generálás
    // -------------------------------------------------------
    static generateToken() {
        return crypto.randomBytes(32).toString("hex");
    }

    // -------------------------------------------------------
    // Token létrehozása egy userhez
    // -------------------------------------------------------
    static async createForUser(userId, name = "default") {
        const token = this.generateToken();

        await Token.insert({
            user_id: userId,
            token: token,
            name: name
        });

        return token;
    }

    // -------------------------------------------------------
    // Token ellenőrzés (csak token rekordot ad vissza)
    // -------------------------------------------------------
    static async verify(token) {
        return await Token.where("token", token).first();
    }

    // -------------------------------------------------------
    // User lekérése token alapján
    // -------------------------------------------------------
    static async getUserByToken(token) {

        // Token rekord
        const tokenRecord = await this.verify(token);
        if (!tokenRecord) return null;

        // Lazy load User → elkerüli require loop-ot
        const User = require(process.cwd() + "/models/User");

        // User lekérése
        return await User.find(tokenRecord.user_id);

        //return { id: tokenRecord.user_id }; // Placeholder visszatérés
    }

    // -------------------------------------------------------
    // Minden token törlése a usertől
    // -------------------------------------------------------
    static async revokeAll(userId) {
        return await Token.where("user_id", userId).delete();
    }
}

module.exports = TokenManager;