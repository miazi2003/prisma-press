import { prisma } from "../../lib/prisma"
import { ICreateCommentPayload, IUpdateCommentPayload } from "./comment.interface";



const getCommentByCommentId = async(commentId : string ) => {
const comment = await prisma.comment.findUniqueOrThrow({
   where : {
     id : commentId
   },
   include : {
    author : {
        select : {
            id : true,
            name : true ,
            email : true 
        }
    },
    post : {
        select : {
            id : true ,
             title : true,
            content : true
           
        }
    }
   }
})

return comment;
}

const getCommentsByAuthorId = async (authorId: string) => {
    const comments = await prisma.comment.findMany({
        where: {
            authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    }
    )


    return comments
}


const createCommentsIntoDB = async (authorId: string, payload: ICreateCommentPayload) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    });

    const comment = await prisma.comment.create({
        data: {
            ...payload,
            authorId
        }
    })
    return comment;
}

const updateCommentsIntoDB = async(authorId : string , commentId : string , data : IUpdateCommentPayload ) => {
const commentData = await prisma.comment.findUniqueOrThrow({
    where : {
        id : commentId,
        authorId
    }
});

const comment = await prisma.comment.update({
    where : {
        id : commentId
    },
    data
    
})


return comment
}

const deleteCommentsFromDB = () => {

}

const handleCommentsFromDB = () => {

}


export const commentService = {
    getCommentsByAuthorId,
    getCommentByCommentId,
    createCommentsIntoDB,
    updateCommentsIntoDB,
    deleteCommentsFromDB,
    handleCommentsFromDB
}