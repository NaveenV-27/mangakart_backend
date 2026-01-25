import bcrypt from "bcrypt";
import { UserProfile } from "../class/userClass";
import mysqlPool from "../config/mysqlConfig";
import util from "util";
import jwt from "jsonwebtoken";
import { Response } from "express";


let queryAsync = util.promisify(mysqlPool.query).bind(mysqlPool);

class UserProfileRepo {

	static async createUserProfile(
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

			const hashedPassword = await bcrypt.hash(password, 10);

			const query = `INSERT INTO users (username, full_name, email, phone_number, gender,  age, password_hash) values (?, ?, ?, ?, ?, ?, ?)`;
			const values = [username, full_name, email, phone_number, gender, age, hashedPassword];
			const result = await queryAsync({ sql: query, values });
			if (result) {
				const payLoad = jwt.sign(
					{
						username: username,
						email: email,
					},
					process.env.JWT_SECRET!,
					{ expiresIn: "1d" }
				);
				res.cookie("USER", payLoad, {
					httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 7 days
				})
				res.cookie("ROLE", "USER", {
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
				})
				res.cookie("Name", full_name?.split(" ")?.['0'], {
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
				})
				return callback({
					apiSuccess: 1,
					username,
					message: "User profile created successfully"
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

	static async userLogin(
		data: {identifier : string; password : string},
		res: Response,
		callback: any
	) {
		try {

			const {
				identifier,
				password
			} = data;

			const query = `SELECT username, full_name, password_hash, email FROM users WHERE username = ? OR email = ?`;
			const values = [identifier, identifier];

			console.log(query, values);

			const response : any = await queryAsync({sql : query, values});
			console.log("Response:" , response);
			const passwordHash = Array.isArray(response)? response[0].password_hash : "";
			const email = Array.isArray(response)? response[0].email : "";
			const full_name = Array.isArray(response)? response[0].full_name : "";
			const username = Array.isArray(response)? response[0].username : "";
			const matched = await bcrypt.compare(password, passwordHash);
			if(matched) {

				const payLoad = jwt.sign(
					{
						username: username,
						email: email,
					},
					process.env.JWT_SECRET!,
					{ expiresIn: "1d" }
				);
				res.cookie("USER", payLoad, {
					httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 7 days
				})
				res.cookie("ROLE", "USER", {
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
				})
				res.cookie("Name", full_name?.split(" ")?.['0'], {
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
				})
				return callback({
					apiSuccess: 1,
					message: "login successful",
				})
			} else {
				return callback({
					apiSuccess: 0,
					message: "Incorrect password",
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

			const query = `SELECT EXISTS(SELECT 1 FROM users WHERE username = ?) AS username_exists;`;
			const values = [username];
			const response = await queryAsync({ sql: query, values });

			const result = Array.isArray(response) ? response[0].username_exists : response;
			if (result === 0) {

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

		} catch (error: any) {
			return callback({
				apiSuccess: -1,
				message: error.message,
			});
		}
	}

	static async checkEmail(
		email: string,
		callback: any
	) {
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
				})
			} else {
				return callback({
					apiSuccess: 1,
					message: "the email is already used",
					isValid: false
				})

			}

		} catch (error: any) {
			return callback({
				apiSuccess: -1,
				message: error.message,
			});
		}
	}

	static async getUserProfile(
		username: string,
		callback: any
	) {
		try {
			const query = 'SELECT username, full_name, email, phone_number, gender, age from users WHERE username = ?';
			const values = [username];
			const response : any = await queryAsync({sql: query, values});
			// console.log("user profile response", response);
			return callback({
				apiSuccess: 1,
				message: "fetched user profile successfully",
				data: response
			})
		} catch (error: any) {
			return callback({
				apiSuccess: -1,
				message: error.message
			})
		}
	}
}

export default UserProfileRepo;