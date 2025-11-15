"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncErrorHandler_1 = require("../middlewares/asyncErrorHandler");
const adminRepo_1 = __importDefault(require("../repo/adminRepo"));
const adminRouter = express_1.default.Router();
adminRouter.post("/create_admin_profile", (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
    const data = req.body;
    await adminRepo_1.default.createAdminProfile(res, data, (response) => {
        if (response.apiSuccess === 1)
            return res.status(200).json(response);
        if (response.apiSuccess === -1)
            return res.status(500).json(response);
        return res.status(400).json(response);
    });
}));
adminRouter.post("/check_username", (0, asyncErrorHandler_1.asyncErrorHandler)(async (req, res) => {
    const { username } = req.body;
    await adminRepo_1.default.checkUsername(username, (response) => {
        if (response.apiSuccess === 1)
            return res.status(200).json(response);
        if (response.apiSuccess === -1)
            return res.status(500).json(response);
        return res.status(400).json(response);
    });
}));
exports.default = adminRouter;
