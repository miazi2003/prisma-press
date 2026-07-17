import { NextFunction, Request, Response } from "express"
import { createAsync } from "../../utils/catchAsync"
import { commentService } from "./comment.service"
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";




const createComment = createAsync(async (req: Request, res: Response, next: NextFunction) => {

    const authorId = req.user?.id;

    if (!authorId) {
        throw new Error("Unauthorized Access");
    }
    const payload = req.body;
    const result = await commentService.createCommentsIntoDB(authorId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Comment Posted Successfully",
        data: result
    })
})

const getCommentByCommentId = createAsync(async (req: Request, res: Response, next: NextFunction) => {
const {commentId} = req.params;
const result = await commentService.getCommentByCommentId(commentId as string);

sendResponse(res , {
    success : true ,
    statusCode : httpStatus.OK,
    message : " Comment Retrived Succesfully",
    data : result
})

})

const getCommentsByAuthorId = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    if (!authorId) {
        throw new Error("Unauthorized Access");
    }

    const result = await commentService.getCommentsByAuthorId(authorId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment Retrived Successfully ",
        data: result
    })
})


const updateComment = createAsync(async (req: Request, res: Response, next: NextFunction) => {
const authorId = req.user?.id;
const {commentId} = req.params;
const data = req.body;

const result =  await commentService.updateCommentsIntoDB(authorId as string , commentId as string , data)

sendResponse(res , {
    success : true ,
    statusCode : httpStatus.OK,
    message : "Comment has been updated0" ,
    data : result
})
})
const deleteComment = createAsync(async (req: Request, res: Response, next: NextFunction) => {
 const {commentId} = req.params;
 const authorId = req.user?.id
 const result = await commentService.deleteCommentsFromDB(commentId as string,authorId as string)

 sendResponse(res , {
    success : true ,
    statusCode : httpStatus.OK,
    message : "Comment Deleted Successfully",
    data :  null
 })
})
const handleCommentByAdmin = createAsync(async (req: Request, res: Response, next: NextFunction) => {
const {commentId} = req.params;
const data = req.body;
const result = await commentService.handleCommentsFromDB(commentId as string , data)

 sendResponse(res , {
    success : true ,
    statusCode : httpStatus.OK,
    message : "Comment Updated Successfully",
    data :  result
 })
})

export const commentController = {
    getCommentsByAuthorId,
    getCommentByCommentId,
    createComment,
    updateComment,
    deleteComment,
    handleCommentByAdmin
}