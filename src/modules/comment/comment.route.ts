import Router from "express"
import auth from "../../middleware/auth"
import { Role } from "../../../generated/prisma/enums"
import { commentController } from "./comment.controller"

const router = Router()

router.get("/author/:authorId", commentController.getCommentById)
router.get("/:commentId", commentController.getComments)
router.post("/", auth(Role.USER, Role.ADMIN), commentController.createComment)
router.patch("/:commentId", auth(Role.USER, Role.ADMIN), commentController.updateComment)
router.delete("/:commentId", auth(Role.USER, Role.ADMIN), commentController.deleteComment)
router.patch("/:commentId/moderate", auth(Role.ADMIN), commentController.handleCommentByAdmin)

export const commentRoute = router