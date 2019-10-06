"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_js_1 = __importDefault(require("crypto-js"));
class AuthenticationResult {
}
exports.AuthenticationResult = AuthenticationResult;
class AuthenticationService {
    constructor() {
        this.secret = "TOKEN_SECRET_FOR_ASAF";
    }
    getToken(userName) {
        let token = jsonwebtoken_1.default.sign({ userName: userName }, this.secret, { expiresIn: '2h' });
        return token;
    }
    authenticate(authorization, userName) {
        try {
            const token = authorization.split(' ')[1];
            const decodedToken = jsonwebtoken_1.default.verify(token, this.secret);
            const decodedUserName = decodedToken.userName;
            if (userName && decodedUserName !== userName) {
                return { authorized: false, message: "Invalid username" };
            }
            else {
                return { authorized: true };
            }
        }
        catch (_a) {
            return { authorized: false, message: "Invalid request" };
        }
    }
    verifyPassword(rawPassword, hashedPassword, passPhrase) {
        let decryptedPassword = crypto_js_1.default.AES.decrypt(hashedPassword, passPhrase).toString(crypto_js_1.default.enc.Utf8);
        return rawPassword == decryptedPassword;
    }
}
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=authentication.service.js.map