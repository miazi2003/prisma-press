import { NextFunction, Request, RequestHandler, Response } from "express"
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt"
import config from "../../config";
import httpStatus from "http-status";
import { userServiceDB } from "./user.service";
import { createAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";



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

const getMyProfile = createAsync(async(req : Request , res : Response , next : NextFunction)=>{
const {accessToken} = req.cookies;
console.log(accessToken)

const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)

if(typeof verifiedToken === "string"){
    throw new Error(verifiedToken)
}

const profile = await userServiceDB.getMyProfileFromDB(verifiedToken.id)


sendResponse(res , {
    success : true , 
    statusCode : httpStatus.OK,
    message : "User Profile Retrieved successfully",
    data : {
        profile
    }

})

})

export const userController = {
    createUser,
    getMyProfile
}