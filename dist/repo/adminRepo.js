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
class AdminProfileRepo {
    static async createAdminProfile(res, data, callback) {
        try {
            const { username, full_name, email, phone_number, password, gender, age } = data;
            const randomNumber = Math.floor(Math.random() * 100000);
            const numericPart = String(randomNumber).padStart(5, '0');
            const adminId = `ADM${numericPart}`;
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const query = `INSERT INTO admins (admin_id, username, full_name, email, phone_number, gender,  age, password_hash) values (?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [adminId, username, full_name, email, phone_number, gender, age, hashedPassword];
            const result = await queryAsync({ sql: query, values });
            if (result) {
                const payLoad = jsonwebtoken_1.default.sign({
                    username: username,
                    email: email,
                }, process.env.JWT_SECRET, { expiresIn: "7d" });
                res.cookie("ADMIN", payLoad, {
                    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 1 day
                });
                res.cookie("ROLE", "ADMIN", {
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
                });
                return callback({
                    apiSuccess: 1,
                    username,
                    admin_id: adminId,
                    message: "Admin profile created successfully"
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
    static async checkUsername(username, callback) {
        try {
            const query = `SELECT EXISTS(SELECT 1 FROM admins WHERE username = ?) AS username_exists;`;
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
}
exports.default = AdminProfileRepo;
