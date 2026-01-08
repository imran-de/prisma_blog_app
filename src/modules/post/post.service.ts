import { create } from "node:domain";
import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (data: Omit<Post, "id" | "CreatedAt" | "updatedAt">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId,
        }
    })

    return result;
}

const getAllPost = async (payload: { search: string | undefined, tags: string[] | [], isFeatured: boolean | undefined, status: PostStatus | undefined, authorId: string | undefined, page: number, limit: number, skip: number, sortBy: string, sortOrder: string }) => {
    // build dynamic where conditions
    const andConditions: PostWhereInput[] = [];
    // search filter any of title, content, tags
    if (payload.search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: payload.search as string,
                        mode: 'insensitive',
                    }
                },
                {
                    content: {
                        contains: payload.search as string,
                        mode: 'insensitive',
                    }
                },
                {
                    tags: {
                        has: payload.search as string,
                    }
                }
            ]
        })
    }
    // tags filter
    if (payload.tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: payload.tags as string[],
            }
        })
    }
    // isFeatured filter
    if (typeof payload.isFeatured === 'boolean') {
        andConditions.push({
            isFeatured: payload.isFeatured,
        })
    }
    // status filter
    if (payload.status) {
        andConditions.push({
            status: payload.status,
        })
    }
    // using authorId filter
    if (payload.authorId) {
        andConditions.push({
            authorId: payload.authorId,
        })
    }
    const allPost = await prisma.post.findMany({
        take: payload.limit,
        skip: payload.skip,
        where: {
            AND: andConditions
        },
        // apply order by if sortBy and sortOrder are provided
        orderBy: payload.sortBy && payload.sortOrder ? { [payload.sortBy]: payload.sortOrder } : {
            createdAt: 'desc'
        },
        include: {
            _count: { select: { comments: true } }
        }
    });
    const total = await prisma.post.count({
        where: {
            AND: andConditions
        }
    })
    return {
        data: allPost,
        pagination: {
            total,
            page: payload.page,
            limit: payload.limit,
            totalPages: Math.ceil(total / payload.limit),
        }
    };
}

const getPostById = async (postId: string) => {

    //! use transaction to increment view count and fetch post data /** if any function or query failed revert those action */
    const result = await prisma.$transaction(async (tx) => {
        // increment view count
        tx.post.update({
            where: {
                id: postId,
            },
            data: {
                views: {
                    increment: 1,
                }
            }
        });
        // fetch post data
        const postData = await tx.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.Approved,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        replies: {
                            where: { status: CommentStatus.Approved },
                            orderBy: {
                                createdAt: 'asc',
                            },
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.Approved
                                    },
                                    orderBy: {
                                        createdAt: 'asc',
                                    }
                                },
                            }
                        },
                    }
                },
                _count: {
                    select: { comments: true }
                }
            }
        });

        return postData;
    })

    return result;
}

const getMyPosts = async (userId: string) => {
    // validate user exists and is active
    await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
            status: 'ACTIVE',
        },
        select: {
            id: true,
            status: true,
        }
    });
    // fetch posts by authorId
    const result = await prisma.post.findMany({
        where: {
            authorId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            _count: {
                select: { comments: true }
            },
        }
    });
    // total count
    const total = await prisma.post.count({
        where: {
            authorId: userId,
        }
    })

    //
    const totalAnotherWay = await prisma.post.aggregate({
        where: {
            authorId: userId,
        },
        _count: {
            id: true,
        },
    });
    return { data: result, total };
}

/**
 * 
 * user only update own post without isFeatured
 * admin can update any post
 */
const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {

    // validate post exists and belongs to author
    const postExists = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            authorId: true,
        }
    });
    if (!isAdmin && postExists.authorId !== authorId) {
        throw new Error("Not permitted to update this post");
    }
    if (!isAdmin) {
        // remove isFeatured from data
        delete data.isFeatured;
    }
    const result = await prisma.post.update({
        where: {
            id: postId,
            authorId: authorId,
        },
        data,
    });

    return result;
}
/**
 * user only delete own post
 * admin can delete any post
 */
const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {

    // validate post exists and belongs to author
    const postExists = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            authorId: true,
        }
    });
    if (!isAdmin && postExists.authorId !== authorId) {
        throw new Error("Not permitted to delete this post");
    }
    const result = await prisma.post.delete({
        where: {
            id: postId,
            authorId: authorId,
        },
    });
    return result;
}

export const postService = {
    createPost,
    getAllPost,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost
}