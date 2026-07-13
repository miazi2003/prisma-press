import { NextFunction, Request, RequestHandler, Response } from "express"
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt"
import config from "../../config";
import httpStatus from "http-status";
import { userServiceDB } from "./user.service";
import { createAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";



const createUser = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userServiceDB.createUserIntoDB(payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Registered Successfully in prisma press",
        data: {
            user
        }
    })
})

export const userController = {
    createUser
}