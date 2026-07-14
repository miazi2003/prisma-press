import cookieParser from "cookie-parser";
import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors"
import config from "./config";
import { prisma } from "./lib/prisma";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { userRoutes } from "./modules/user/user.route";
import { authRouter } from "./modules/auth/auth.route";
import { jwtUtils } from "./utils/jwt";
import { Role } from "../generated/prisma/enums";
const app: Application = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: config.app_url,
    credentials: true,
}))

app.get("/", async (req: Request, res: Response) => {
    res.send("Welcome To Prisma Press!")
})

// app.post()

app.use("/api/users", userRoutes)
app.use("/api/auth", authRouter)


export default app;