import { NextFunction, Request, Response } from "express";
import { createAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";



const loginUser = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const loginResult = await authService.loginUser(payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: {
            loginResult
        }

    })

})



export const authController = {
    loginUser
}