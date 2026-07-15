import { NextFunction, Request, Response } from "express"
import { createAsync } from "../../utils/catchAsync"
import { ICreatePostPayload } from "./post.interface"
import { postService } from "./post.service"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status"


const getAllPosts = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getAllPostsFromDB()
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: " All post retrieved successfully",
        data: {
            result
        }
    })
})
const getPostStats = () => {

}
const getMyPost = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const result = await postService.getMyPostFromDB(authorId as string)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All My Post Retrived Successfully",
        data: result
    })
})
const getPostById = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const result = await postService.getPostByIdFromDB(postId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.FOUND,
        message: "Post Retrieved succcessfully",
        data: result
    })
})
const createPost = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;
    const result = await postService.createPostIntoDB(payload, id as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Your Post Has Been Created",
        data: result

    })
})
const updatePost = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params?.postId;
    const authorId = req.user?.id;
    const payload = req.body;
    const isAdmin = req.user?.role === "ADMIN";

    const result = await postService.updatePostIntoDB(postId as string, payload, authorId as string, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post Updated Successfully",
        data: result
    })


})
const deletePost = createAsync(async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params?.postId;
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const result = await postService.deletePostFromDB(postId as string, authorId as string, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post deleted Successfully",
        data: result
    })


})


export const postController = {
    getAllPosts,
    getPostStats,
    getMyPost,
    getPostById,
    createPost,
    updatePost,
    deletePost
}

