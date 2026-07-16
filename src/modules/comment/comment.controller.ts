import { NextFunction, Request, Response } from "express"
import { createAsync } from "../../utils/catchAsync"
import { commentService } from "./comment.service"
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
const createComment = createAsync(async (req: Request, res: Response, next: NextFunction) => {
const authorId = req.user?.id;
const payload = req.body;
const result = await commentService.createCommentsIntoDB(authorId as string , payload);

sendResponse(res , {
    success : true ,
    statusCode : httpStatus.CREATED,
    message : "Comment Posted Successfully",
    data : {
        result
    }
})
})

const getCommentByCommentId = createAsync(async (req: Request, res: Response, next: NextFunction) => {

})

const getCommentsByAuthorId = createAsync(async (req: Request, res: Response, next: NextFunction) => {

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