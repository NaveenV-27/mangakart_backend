"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = void 0;
// middlewares/authMiddleware.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateUser = (req, res, next) => {
    const secret = process.env.JWT_SECRET || "default_secret";
    const token = req.cookies?.user;
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: "No auth token found" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log("the user", decoded);
        req.body.user_name = decoded?.user_name;
        req.body.password = decoded?.password;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.validateUser = validateUser;
