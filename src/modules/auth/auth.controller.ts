import { NextFunction, Request, Response } from "express";
import { createAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";



const loginUser = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { accessToken, refreshToken } = await authService.loginUser(payload)

    //cookie set 
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })
    //response 
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: { accessToken, refreshToken }

    })

})


const refreshToken = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken
    console.log(token)
    const {accessToken} = await authService.refreshToken(token)

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

    sendResponse(res , {
        success : true ,
        statusCode : httpStatus.OK,
        message : "Token refreshed successfully",
        data : {
            accessToken
        }
    })

})


export const authController = {
    loginUser,
    refreshToken
}