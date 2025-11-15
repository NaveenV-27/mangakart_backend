"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mysqlConfig_1 = __importDefault(require("../config/mysqlConfig"));
const util_1 = __importDefault(require("util"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let queryAsync = util_1.default.promisify(mysqlConfig_1.default.query).bind(mysqlConfig_1.default);
class UserProfileRepo {
    static async createUserProfile(res, data, callback) {
        try {
            const { username, full_name, email, phone_number, password, gender, age } = data;
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const query = `INSERT INTO users (username, full_name, email, phone_number, gender,  age, password_hash) values (?, ?, ?, ?, ?, ?, ?)`;
            const values = [username, full_name, email, phone_number, gender, age, hashedPassword];
            const result = await queryAsync({ sql: query, values });
            if (result) {
                const payLoad = jsonwebtoken_1.default.sign({
                    username: username,
                    email: email,
                }, process.env.JWT_SECRET, { expiresIn: "1d" });
                res.cookie("USER", payLoad, {
                    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 7 days
                });
                res.cookie("ROLE", "USER", {
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
                });
                res.cookie("Name", full_name?.split(" ")?.['0'], {
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
                });
                return callback({
                    apiSuccess: 1,
                    username,
                    message: "User profile created successfully"
                });
            }
            else {
                return callback({
                    apiSuccess: 0,
                    message: result
                });
            }
        }
        catch (error) {
            return callback({
                apiSuccess: -1,
                message: error.message,
            });
        }
    }
    static async userLogin(data, res, callback) {
        try {
            const { identifier, password } = data;
            const query = `SELECT username, full_name, password_hash, email FROM users WHERE username = ? OR email = ?`;
            const values = [identifier, identifier];
            console.log(query, values);
            const response = await queryAsync({ sql: query, values });
            console.log("Response:", response);
            const passwordHash = Array.isArray(response) ? response[0].password_hash : "";
            const email = Array.isArray(response) ? response[0].email : "";
            const full_name = Array.isArray(response) ? response[0].full_name : "";
            const username = Array.isArray(response) ? response[0].username : "";
            const matched = await bcrypt_1.default.compare(password, passwordHash);
            if (matched) {
                const payLoad = jsonwebtoken_1.default.sign({
                    username: username,
                    email: email,
                }, process.env.JWT_SECRET, { expiresIn: "1d" });
                res.cookie("USER", payLoad, {
                    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 7 days
                });
                res.cookie("ROLE", "USER", {
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
                });
                res.cookie("Name", full_name?.split(" ")?.['0'], {
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
                });
                return callback({
                    apiSuccess: 1,
                    message: "login successful",
                });
            }
            else {
                return callback({
                    apiSuccess: 0,
                    message: "Incorrect password",
                });
            }
        }
        catch (error) {
            return callback({
                apiSuccess: -1,
                message: error.message,
            });
        }
    }
    static async checkUsername(username, callback) {
        try {
            const query = `SELECT EXISTS(SELECT 1 FROM users WHERE username = ?) AS username_exists;`;
            const values = [username];
            const response = await queryAsync({ sql: query, values });
            const result = Array.isArray(response) ? response[0].username_exists : response;
            if (result === 0) {
                return callback({
                    apiSuccess: 1,
                    message: "The given username is valid",
                    isValid: true
                });
            }
            else {
                return callback({
                    apiSuccess: 1,
                    message: "the username is already taken",
                    isValid: false
                });
            }
        }
        catch (error) {
            return callback({
                apiSuccess: -1,
                message: error.message,
            });
        }
    }
    static async checkEmail(email, callback) {
        try {
            const query = `SELECT EXISTS(SELECT 1 FROM users WHERE email = ?) AS email_exists;`;
            const values = [email];
            const response = await queryAsync({ sql: query, values });
            const result = Array.isArray(response) ? response[0].email_exists : response;
            if (result === 0) {
                return callback({
                    apiSuccess: 1,
                    message: "The given email is valid",
                    isValid: true
                });
            }
            else {
                return callback({
                    apiSuccess: 1,
                    message: "the email is already used",
                    isValid: false
                });
            }
        }
        catch (error) {
            return callback({
                apiSuccess: -1,
                message: error.message,
            });
        }
    }
}
exports.default = UserProfileRepo;
