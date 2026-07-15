import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface"

const getAllPostsFromDB = async () => {
  const posts = await prisma.post.findMany({
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
      const totalPosts = await tx.post.count();
      const totalPublishedPosts = await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED
        }
      });
      const totalArchivedPosts = await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED
        }
      });
      const totalDraftedPosts = await tx.post.count({
        where: {
          status: PostStatus.DRAFT
        }
      });
      const totalComments = await tx.post.count();
      const totalApporvedComments = await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED
        }
      });
      const totalRejectedComments = await tx.comment.count({
        where: {
          status: CommentStatus.REJECT
        }
      });

      const totalPostViews = await tx.post.aggregate({
        _sum: {
          views: true
        }
      })

      return {
        totalPosts,
        totalPublishedPosts,
        totalArchivedPosts,
        totalDraftedPosts,
        totalComments,
        totalApporvedComments,
        totalRejectedComments,
        totalPostViews
      }
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