import Router from "express"
import auth from "../../middleware/auth"
import { Role } from "../../../generated/prisma/enums"
import { postController } from "./post.controller"

const router = Router()
router.get("/", postController.getAllPosts)
router.get("/stats", auth(Role.ADMIN), postController.getPostStats)
router.get("/my-posts", auth(Role.USER, Role.ADMIN), postController.getMyPost)
router.get("/:postId", auth(), postController.getPostById)
router.post("/", auth(Role.ADMIN, Role.USER), postController.createPost)
router.patch("/:postId", auth(Role.USER, Role.ADMIN), postController.updatePost)
router.delete("/:postId", auth(Role.USER, Role.ADMIN), postController.deletePost)


export const postRoute = router