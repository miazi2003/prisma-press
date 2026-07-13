import { NextFunction, Request, Response } from "express";
import { createAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";



const loginUser = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const {accessToken , refershToken} = await authService.loginUser(payload)

    //cookie set 
    res.cookie("accessToken" , accessToken , {
        httpOnly : true , 
        secure : true , 
        sameSite : "none" ,
        maxAge : 1000 * 60 * 60 * 24
    } )

    res.cookie("refershToken" , refershToken , {
        httpOnly : true , 
        secure : true , 
        sameSite : "none" ,
        maxAge : 1000 * 60 * 60 * 24 * 7
    } )
//response 
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: { accessToken , refershToken }

    })

})



export const authController = {
    loginUser
}