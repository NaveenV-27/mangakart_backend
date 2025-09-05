// middlewares/authMiddleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret = process.env.JWT_SECRET || "default_secret";

  const token = req.cookies?.user;
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "No auth token found" });
  }

  try {
    const decoded: any = jwt.verify(token, secret);
    console.log("the user", decoded);
    req.body.user_name = decoded?.user_name;
    req.body.password = decoded?.password;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
