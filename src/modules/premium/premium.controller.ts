import { NextFunction, Request, Response } from "express"
import { createAsync } from "../../utils/catchAsync"
import { premiumServices } from "./premium.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"
const getPremiumContent = createAsync(async(req : Request , res : Response , next : NextFunction)=>{
    const query = req.query;
    const result = await premiumServices.getPremiumContent(query)

    sendResponse(res , {
        success : true ,
        statusCode : httpStatus.OK,
        message : "Premium post retrived successfully",
        data : result
    })
})

export const  premiumController = 
{getPremiumContent}
