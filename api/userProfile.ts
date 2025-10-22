import express from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mysql from "mysql2";

const userRouter = express.Router();
userRouter.post("/user_profile", (req : Request, res : Response) => {
    console.log(req.body, req.cookies);
    try {
        const cookies = req.cookies?.user;
        console.log("Cookie:", cookies);
        const data = req.body;
        const secret = process.env.JWT_SECRET || "naveen";
        const isloggedIn = jwt.verify(cookies, secret);
        if(isloggedIn) {
            console.log("Already logged in", isloggedIn);
            res.send("Logged in already");
        } else {
            console.log("signing...");
            const token = jwt.sign(data, secret);
            console.log("Request:", token);
            res.cookie("user",token);
            res.json(token);
        }
    } catch (err : unknown) {
        console.error(err);
        res.send(err);
    }
});

// userRouter.post("/get_user_data", )
userRouter.post("/create_user", (req : Request, res : Response) => {
  console.log("Body:", req.body);
  res.send("Theres still time..");
});


userRouter.post("/login", (req : Request, res : Response) => {
    console.log("Body:", req.body);
    
    res.send("Theres still time..");
})
export default userRouter;