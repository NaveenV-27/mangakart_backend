import bcrypt from "bcrypt";
import { UserProfile } from "../class/userClass";
import db from "../config/mysqlConfig";
import jwt from "jsonwebtoken";
import { Response } from "express";

import Volumes from "../MongoModels/Volume";

class AdminProfileRepo {

  // 🔥 CREATE ADMIN
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
      const numericPart = String(randomNumber).padStart(5, "0");
      const adminId = `ADM${numericPart}`;

      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO admins 
        (admin_id, username, full_name, email, phone_number, gender, age, password_hash) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result]: any = await db.execute(query, [
        adminId,
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
            admin_id: adminId,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" }
        );

        res.cookie("ADMIN", payLoad, {
          httpOnly: true,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.cookie("ROLE", "ADMIN", {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return callback({
          apiSuccess: 1,
          username,
          admin_id: adminId,
          message: "Admin profile created successfully",
        });
      } else {
        return callback({
          apiSuccess: 0,
          message: "Failed to create admin",
        });
      }

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
          SELECT 1 FROM admins WHERE username = ?
        ) AS username_exists
      `;

      const [rows]: any = await db.execute(query, [username]);

      const exists = rows[0]?.username_exists;

      if (exists === 0) {
        return callback({
          apiSuccess: 1,
          message: "The given username is valid",
          isValid: true,
        });
      } else {
        return callback({
          apiSuccess: 1,
          message: "Username already taken",
          isValid: false,
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
  static async adminLogin(
    data: { identifier: string; password: string },
    res: Response,
    callback: any
  ) {
    try {
      const { identifier, password } = data;

      const query = `
        SELECT admin_id, username, full_name, password_hash, email 
        FROM admins 
        WHERE admin_id = ? OR username = ?
      `;

      const [rows]: any = await db.execute(query, [identifier, identifier]);

      if (!rows || rows.length === 0) {
        return callback({
          apiSuccess: 0,
          message: "Admin not found",
        });
      }

      const admin = rows[0];

      const matched = await bcrypt.compare(password, admin.password_hash);

      if (!matched) {
        return callback({
          apiSuccess: 0,
          message: "Incorrect password",
        });
      }

      const payLoad = jwt.sign(
        {
          username: admin.username,
          admin_id: admin.admin_id,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      res.cookie("ADMIN", payLoad, {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie("ROLE", "ADMIN", {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie("Name", admin.full_name?.split(" ")?.[0], {
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

  // 👤 GET PROFILE
  static async getAdminProfile(
    username: string,
    admin_id: string,
    callback: any
  ) {
    try {
      const query = `
        SELECT username, admin_id, full_name, email, phone_number, gender, age 
        FROM admins 
        WHERE admin_id = ? OR username = ?
      `;

      const [rows]: any = await db.execute(query, [admin_id, username]);

      return callback({
        apiSuccess: 1,
        message: "Fetched admin profile successfully",
        data: rows,
      });

    } catch (error: any) {
      return callback({
        apiSuccess: -1,
        message: error.message,
      });
    }
  }

  static async getAdminStats(admin_id: string, callback: any) {
    try {
      const query = `
        SELECT volume_id, count(volume_id) as vol_count
        from order_items where seller_id= ? group by volume_id order by vol_count desc;
      `;

      const [topVolumes]: any = await db.execute(query, [admin_id]);
      console.log("Admin stats rows:", topVolumes);

      const volumeIds = topVolumes.map((v: any) => v.volume_id);

      const volumes = await Volumes.find({
        volume_id: { $in: volumeIds }
      });

      const volumeMap = new Map();

      volumes.forEach(v => {
        volumeMap.set(v.volume_id, v);
      });

      const result = topVolumes.map((v: any) => ({
        volume_id: v.volume_id,
        total_sold: v.total_sold,
        volume_title: volumeMap.get(v.volume_id)?.volume_title,
        manga_id: volumeMap.get(v.volume_id)?.manga_id,
      }));

      return callback({
        apiSuccess: 1,
        message: "Fetched admin stats successfully",
        data: result,
      });

    } catch (error: any) {
      return callback({
        apiSuccess: -1,
        message: error.message,
      });
    }
  }
}

export default AdminProfileRepo;