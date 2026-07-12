import {Request, Response} from "express"
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt"
import config from "../../config";
import httpStatus from "http-status";
import { userServiceDB } from "./user.service";

const createUser = async (req: Request, res: Response) => {
   try{
     const payload = req.body;
    const user = await userServiceDB.createUserIntoDB(payload)
   

    res.status(httpStatus.CREATED).json({
        success : true,
        statusCode : httpStatus.CREATED,
        message: "User Registered Successfully in prisma press",
        data : {
            user
        }
    })
   }catch (error) {
console.log(error) 
res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success : false,
        statusCode : httpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to register user",
        error : (error as Error).message
    })
   }
}


export const  userController =  {
    createUser
}