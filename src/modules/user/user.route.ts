import { NextFunction, Request, Response, Router } from "express"
import { userController } from "./user.controller";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";
import httpStatus from "http-status";
import { createAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import auth from "../../middleware/auth";
const router = Router();

router.post("/register", userController.createUser)
router.get("/me", auth(Role.USER, Role.AUTHOR), userController.getMyProfile)
router.put("/my-profile", auth(Role.USER, Role.AUTHOR), userController.updateMyProfile)


export const userRoutes = router