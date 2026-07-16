import { prisma } from "../../lib/prisma"
import { ICreateCommentPayload } from "./comment.interface";



const getCommentByCommentId = () => {

}

const getCommentsByAuthorId = async(authorId : string) => {
const comments = await prisma.comment.findMany({
    where : {
        authorId
    },
    orderBy : {
        createdAt : "desc"
    }
})


return comments
}


const createCommentsIntoDB = async(authorId : string , payload : ICreateCommentPayload) => {
await prisma.post.findUniqueOrThrow({
    where : {
        id : payload.postId
    }
});

const comment = await prisma.comment.create({
  data : {
    ...payload,
    authorId
  }
})
return comment;
}

const updateCommentsIntoDB = () => {

}

const deleteCommentsFromDB = () => {

}

const handleCommentsFromDB = () => {

}


export const commentService =  {
getCommentsByAuthorId,
getCommentByCommentId,
createCommentsIntoDB,
updateCommentsIntoDB,
deleteCommentsFromDB,
handleCommentsFromDB
}