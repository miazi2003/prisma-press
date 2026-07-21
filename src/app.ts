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
import { commentRoute } from "./modules/comment/comment.route";
import { postRoute } from "./modules/post/post.route";
import notFound from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { subscriptionRoute } from "./modules/subscription/subscription.route";
import { subscriptionController } from "./modules/subscription/subscription.controller";
import { premiumRoute } from "./modules/premium/premium.route";
const app: Application = express();

app.post(
    "/api/subscription/webhook",
    express.raw({ type: "application/json" }),
    subscriptionController.handleWebhook
);

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
app.use("/api/posts", postRoute)
app.use("/api/comments", commentRoute)
app.use("/api/subscription", subscriptionRoute)
app.use("/api/premium", premiumRoute)



app.use(notFound)

app.use(globalErrorHandler)


export default app;