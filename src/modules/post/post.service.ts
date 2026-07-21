import { CommentStatus, PostStatus, Role, SubscriptionStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface";

const getAllPostsFromDB = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";
  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags) ? tags : [];

  const andConditions: PostWhereInput[] = [];

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

  if (query.title) {
    andConditions.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }
  if (query.tags) {
    andConditions.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  andConditions.push({
    isPremium: false,
  });

  const posts = await prisma.post.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
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
  const transactionResult = await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      totalPublishedPosts,
      totalArchivedPosts,
      totalDraftedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews,
    ] = await Promise.all([
      tx.post.count(),
      tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      tx.comment.count(),
      tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      tx.comment.count({
        where: {
          status: CommentStatus.REJECT,
        },
      }),
      tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPosts,
      totalArchivedPosts,
      totalDraftedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews: totalPostViews._sum.views ?? 0,
    };
  });
  return transactionResult;
};

const getMyPostFromDB = async (authorId: string) => {
  const posts = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
          id: true,
        },
      },
      comments: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return posts;
};

const getPostByIdFromDB = async (postId: string, user?: { id: string; role: Role }) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUniqueOrThrow({
      where: { id: postId },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (post.isPremium) {
      if (!user) {
        throw new Error("Please subscribe to get access to Premium Contents");
      }

      const isAuthorOrAdmin = user.role === Role.ADMIN || user.id === post.authorId;
      if (!isAuthorOrAdmin) {
        const subscription = await tx.subscription.findUnique({
          where: { userId: user.id },
        });

        const isSubscribed =
          subscription &&
          subscription.status === SubscriptionStatus.ACTIVE &&
          subscription.currentPeriodEnd &&
          new Date(subscription.currentPeriodEnd) > new Date();

        if (!isSubscribed) {
          throw new Error("Please subscribe to get access to Premium Contents");
        }
      }
    }

    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return post;
  });

  return transactionResult;
};

const createPostIntoDB = async (payload: ICreatePostPayload, userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      subscriptions: true,
    },
  });

  if (payload.isPremium && user.role !== Role.ADMIN) {
    const sub = user.subscriptions;
    const isSubscribed =
      sub &&
      sub.status === SubscriptionStatus.ACTIVE &&
      sub.currentPeriodEnd &&
      new Date(sub.currentPeriodEnd) > new Date();

    if (!isSubscribed) {
      throw new Error("You are not a premium user. So You can not create Premium content");
    }
  }

  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const updatePostIntoDB = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean
) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You dont have permission to access this resources");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        select: {
          name: true,
          id: true,
        },
      },
      comments: true,
    },
  });

  return result;
};

const deletePostFromDB = async (postId: string, authorId: string, isAdmin: boolean) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You dont ahve permission to access this resources");
  }

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return result;
};

export const postService = {
  getAllPostsFromDB,
  getStatsFromDB,
  getMyPostFromDB,
  getPostByIdFromDB,
  createPostIntoDB,
  updatePostIntoDB,
  deletePostFromDB,
};