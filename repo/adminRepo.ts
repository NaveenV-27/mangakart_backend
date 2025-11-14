import bcrypt from "bcrypt";
import { UserProfile } from "../class/userClass";
import mysqlPool from "../config/mysqlConfig";
import util from "util";
import jwt from "jsonwebtoken";
import { Response } from "express";


let queryAsync = util.promisify(mysqlPool.query).bind(mysqlPool);

class AdminProfileRepo {

	static async createAdminProfile(
		res: Response,
		data: UserProfile,
		callback: any
	) {

		try {

			const {
				username,
				full_name,
				email,
				phone_number,
				password,
				gender,
				age
			} = data;

			const randomNumber = Math.floor(Math.random() * 100000);

			const numericPart = String(randomNumber).padStart(5, '0');

			const adminId = `ADM${numericPart}`;

			const hashedPassword = await bcrypt.hash(password, 10);

			const query = `INSERT INTO admins (admin_id, username, full_name, email, phone_number, gender,  age, password_hash) values (?, ?, ?, ?, ?, ?, ?, ?)`;
			const values = [adminId, username, full_name, email, phone_number, gender, age, hashedPassword];
			const result = await queryAsync({ sql: query, values });
			if (result) {
				const payLoad = jwt.sign(
					{
						username: username,
						email: email,
					},
					process.env.JWT_SECRET!,
					{ expiresIn: "7d" }
				);
				res.cookie("ADMIN", payLoad, {
					httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 1 day
				})

				res.cookie("ROLE",  "ADMIN",{
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
				})
				return callback({
					apiSuccess: 1,
					username,
					admin_id: adminId,
					message: "Admin profile created successfully"
				})
			} else {
				return callback({
					apiSuccess: 0,
					message: result
				})
			}
		} catch (error: any) {
			return callback({
				apiSuccess: -1,
				message: error.message,
			});
		}

	}

	static async checkUsername(
		username: string,
		callback: any
	) {
		try {

			const query = `SELECT EXISTS(SELECT 1 FROM admins WHERE username = ?) AS username_exists;`;
			const values = [username];
			const response = await queryAsync({sql: query, values});

			const result = Array.isArray(response)? response[0].username_exists : response;
			if(result === 0) {

				return callback({
					apiSuccess: 1,
					message: "The given username is valid",
					isValid: true
				})
			} else {
				return callback({
					apiSuccess: 1,
					message: "the username is already taken",
					isValid: false
				})

			}

		} catch (error : any) {
			return callback({
				apiSuccess: -1,
				message: error.message,
			});
		}
	}
}

export default AdminProfileRepo;