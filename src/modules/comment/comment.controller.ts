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
const commentId = req.body;
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

})
const deleteComment = createAsync(async (req: Request, res: Response, next: NextFunction) => {

})
const handleCommentByAdmin = createAsync(async (req: Request, res: Response, next: NextFunction) => {

})

export const commentController = {
    getCommentsByAuthorId,
    getCommentByCommentId,
    createComment,
    updateComment,
    deleteComment,
    handleCommentByAdmin
}