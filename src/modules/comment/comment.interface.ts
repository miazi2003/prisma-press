import { CommentStatus } from "../../../generated/prisma/enums";

export interface ICreateCommentPayload {
  content: string;
  authorId: string;
  postId: string;
}

export interface IUpdateCommentPayload {
    content? : string ;
    status? : CommentStatus;
}

export interface IModeratePayload {
  status : CommentStatus
}