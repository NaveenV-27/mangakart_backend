import bcrypt from "bcrypt";
import { UserProfile } from "../class/userClass";
import db from "../config/mysqlConfig";
import jwt from "jsonwebtoken";
import { Response } from "express";

class UserProfileRepo {

  // 🔥 CREATE USER
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

      const query = `
        INSERT INTO users 
        (username, full_name, email, phone_number, gender, age, password_hash) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result]: any = await db.execute(query, [
        username,
        full_name,
        email,
        phone_number,
        gender,
        age,
        hashedPassword,
      ]);

      if (result.affectedRows > 0) {
        const payLoad = jwt.sign(
          {
            username,
            email,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "1d" }
        );

        res.cookie("USER", payLoad, {
          httpOnly: true,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.cookie("ROLE", "USER", {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.cookie("Name", full_name?.split(" ")?.[0], {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return callback({
          apiSuccess: 1,
          username,
          message: "User profile created successfully",
        });
      } else {
        return callback({
          apiSuccess: 0,
          message: "Failed to create user",
        });
      }

    } catch (error: any) {
      return callback({
        apiSuccess: -1,
        message: error.message,
      });
    }
  }

  // 🔐 LOGIN
  static async userLogin(
    data: { identifier: string; password: string },
    res: Response,
    callback: any
  ) {
    try {
      const { identifier, password } = data;

      const query = `
        SELECT username, full_name, password_hash, email 
        FROM users 
        WHERE username = ? OR email = ?
      `;

      const [rows]: any = await db.execute(query, [identifier, identifier]);

      if (!rows || rows.length === 0) {
        return callback({
          apiSuccess: 0,
          message: "User not found",
        });
      }

      const user = rows[0];

      const matched = await bcrypt.compare(password, user.password_hash);

      if (!matched) {
        return callback({
          apiSuccess: 0,
          message: "Incorrect password",
        });
      }

      const payLoad = jwt.sign(
        {
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.cookie("USER", payLoad, {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie("ROLE", "USER", {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie("Name", user.full_name?.split(" ")?.[0], {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return callback({
        apiSuccess: 1,
        message: "login successful",
      });

    } catch (error: any) {
      return callback({
        apiSuccess: -1,
        message: error.message,
      });
    }
  }

  // 🔍 CHECK USERNAME
  static async checkUsername(username: string, callback: any) {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM users WHERE username = ?
        ) AS username_exists
      `;

      const [rows]: any = await db.execute(query, [username]);

      const exists = rows[0]?.username_exists;

      return callback({
        apiSuccess: 1,
        message: exists ? "Username already taken" : "Username is valid",
        isValid: !exists,
      });

    } catch (error: any) {
      return callback({
        apiSuccess: -1,
        message: error.message,
      });
    }
  }

  // 📧 CHECK EMAIL
  static async checkEmail(email: string, callback: any) {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM users WHERE email = ?
        ) AS email_exists
      `;

      const [rows]: any = await db.execute(query, [email]);

      const exists = rows[0]?.email_exists;

      return callback({
        apiSuccess: 1,
        message: exists ? "Email already used" : "Email is valid",
        isValid: !exists,
      });

    } catch (error: any) {
      return callback({
        apiSuccess: -1,
        message: error.message,
      });
    }
  }

  // 👤 GET PROFILE
  static async getUserProfile(
    username: string,
    callback: any
  ) {
    try {
      const query = `
        SELECT username, full_name, email, phone_number, gender, age 
        FROM users 
        WHERE username = ?
      `;

      const [rows]: any = await db.execute(query, [username]);

      return callback({
        apiSuccess: 1,
        message: "Fetched user profile successfully",
        data: rows,
      });

    } catch (error: any) {
      return callback({
        apiSuccess: -1,
        message: error.message,
      });
    }
  }
}

export default UserProfileRepo;