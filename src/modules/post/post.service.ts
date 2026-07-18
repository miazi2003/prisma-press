import { json } from "node:stream/consumers";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface"
import { array } from "node:stream/iter";

const getAllPostsFromDB = async (query : IPostQuery) => {


  const limit = query.limit ? Number(query.limit) : 10 ;
  const page = query.page ? Number(query.page) : 1 ;
  const skip = (page - 1) * limit;
  const sortBy =  query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc"
  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags ) ? tags : []


  const andConditions : PostWhereInput[] =  []

//Serach Term
if (query.searchTerm) {
  andConditions.push({
    OR: [
      {
        title: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
    ],
  });
}

//title
if(query.title){
  andConditions.push({
    title : query.title
  })
}

//content
if(query.content){
andConditions.push({
  content : query.content
})
}

if(query.authorId){
  andConditions.push({
    authorId : query.authorId
  })
}

if(query.isFeatured){
  andConditions.push({
    isFeatured : Boolean(query.isFeatured)
  })
}
if(query.tags){
  andConditions.push({
    tags : {
      hasSome : tagsArray
    }
  })
}


if(query.status){
  andConditions.push({
    status : query.status
  })
}


   
  const posts = await prisma.post.findMany({

    where : {
      AND : andConditions
    },

    take : limit,
    skip : skip,






    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: true,
    },
  });

  return posts;
};




const getStatsFromDB = async () => {
  const transactionResult = await prisma.$transaction(
    async (tx) => {
      // const totalPosts = await tx.post.count();
      // const totalPublishedPosts = await tx.post.count({
      //   where: {
      //     status: PostStatus.PUBLISHED
      //   }
      // });
      // const totalArchivedPosts = await tx.post.count({
      //   where: {
      //     status: PostStatus.ARCHIVED
      //   }
      // });
      // const totalDraftedPosts = await tx.post.count({
      //   where: {
      //     status: PostStatus.DRAFT
      //   }
      // });
      // const totalComments = await tx.post.count();
      // const totalApporvedComments = await tx.comment.count({
      //   where: {
      //     status: CommentStatus.APPROVED
      //   }
      // });
      // const totalRejectedComments = await tx.comment.count({
      //   where: {
      //     status: CommentStatus.REJECT
      //   }
      // });

      // const totalPostViews = await tx.post.aggregate({
      //   _sum: {
      //     views: true
      //   }
      // })

      // return {
      //   totalPosts,
      //   totalPublishedPosts,
      //   totalArchivedPosts,
      //   totalDraftedPosts,
      //   totalComments,
      //   totalApporvedComments,
      //   totalRejectedComments,
      //   totalPostViews
      // };



     const [
        totalPosts,
        totalPublishedPosts,
        totalArchivedPosts,
        totalDraftedPosts,
        totalComments,
        totalApprovedComments,
        totalRejectedComments,
        totalPostViews 
      ] = await Promise.all([
         tx.post.count(),
         tx.post.count({
          where: {
            status: PostStatus.PUBLISHED
          }
        }),
         tx.post.count({
          where: {
            status: PostStatus.ARCHIVED
          }
        }),
         tx.post.count({
          where: {
            status: PostStatus.DRAFT
          }
        }),
         tx.comment.count(),
         tx.comment.count({
          where: {
            status: CommentStatus.APPROVED
          }
        }),
         tx.comment.count({
          where: {
            status: CommentStatus.REJECT
          }
        }),
         tx.post.aggregate({
        _sum: {
          views: true
        }
      })






      ])

        return {
        totalPosts,
        totalPublishedPosts,
        totalArchivedPosts,
        totalDraftedPosts,
        totalComments,
        totalApprovedComments,
        totalRejectedComments,
        totalPostViews : totalPostViews._sum.views ?? 0
      };
    }
  );
  return transactionResult;
};




const getMyPostFromDB = async (authorId: string) => {
  const posts = await prisma.post.findMany({
    where: {
      authorId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      author: {
        select: {
          name: true,
          id: true
        }
      },
      comments: true,

      _count: {
        select: {
          comments: true
        }
      }


    }
  })

  return posts
};




const getPostByIdFromDB = async (postId: string) => {



  // await prisma.post.update({
  //   where: {
  //     id: postId
  //   },
  //   data: {
  //     views: {
  //       increment: 1
  //     }
  //   }
  // })


  // const post = await prisma.post.findUniqueOrThrow({
  //   where: { id: postId },

  //   include: {
  //     author: {
  //       omit: {
  //         password: true,

  //       }
  //     },

  //     comments: {
  //       where : {
  //         status : CommentStatus.APPROVED
  //       },
  //       orderBy : {
  //         createdAt : "desc"
  //       },

  //     },
  //     _count : {
  //       select : {
  //         comments : true
  //       }
  //     }

  //   }
  // })



  const transactionResult = await prisma.$transaction(
    async (tx) => {

      //update with transaction
      await tx.post.update({
        where: {
          id: postId
        },
        data: {
          views: {
            increment: 1
          }
        }
      });

      // throw new Error("fake error")
      //get post with transaction
      const post = await tx.post.findUniqueOrThrow({
        where: { id: postId },

        include: {
          author: {
            omit: {
              password: true,

            }
          },

          comments: {
            where: {
              status: CommentStatus.APPROVED
            },
            orderBy: {
              createdAt: "desc"
            },

          },
          _count: {
            select: {
              comments: true
            }
          }

        }
      });

      return post
    }

  )

  return transactionResult;
};





const createPostIntoDB = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId
    }

  })

  return result;
};




const updatePostIntoDB = async (postId: string, payload: IUpdatePostPayload, authorId: string, isAdmin: boolean) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId
    }
  })

  if (!post) {
    throw new Error("Post not found")
  }


  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You dont have permission to access this resources")
  }

  const result = await prisma.post.update({
    where: {
      id: postId
    },
    data: payload,
    include: {
      author: {
        select: {
          name: true,
          id: true
        }
      },
      comments: true
    }

  })

  return result;


};



const deletePostFromDB = async (postId: string, authorId: string, isAdmin: boolean) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId
    }
  })

  if (!post) {
    throw new Error("Post not found")
  }

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You dont ahve permission to access this resources")
  }

  const result = await prisma.post.delete({
    where: {
      id: postId
    }
  })

  return result
};





export const postService = {
  getAllPostsFromDB,
  getStatsFromDB,
  getMyPostFromDB,
  getPostByIdFromDB,
  createPostIntoDB,
  updatePostIntoDB,
  deletePostFromDB,
}