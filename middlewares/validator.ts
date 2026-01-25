import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const validateUser = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const secret = process.env.JWT_SECRET || "default_secret";

  const token = req.cookies?.ADMIN || req.cookies?.USER;
  const role = req.cookies?.ROLE;
  // console.log("the role", role);
  // console.log(token);

  if (!token) {
    return res.status(401).json({ message: "No auth token found" });
  }

  try {
    const decoded: any = jwt.verify(token, secret);
    // console.log("the user", decoded, decoded?.username);
    req.user = {
      username: decoded.username,
      admin_id: decoded.admin_id,
      role: req.cookies?.ROLE,
    };
    console.log("Body:", req.body)
    next();
  } catch (error :any) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
