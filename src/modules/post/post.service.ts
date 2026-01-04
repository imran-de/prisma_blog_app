import { Post, PostStatus } from "../../../generated/prisma/client";
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

const getAllPost = async (payload: { search: string | undefined, tags: string[] | [], isFeatured: boolean | undefined, status: PostStatus | undefined, authorId: string | undefined }) => {
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
        where: {
            AND: andConditions
        }
    });
    return allPost;
}

export const postService = {
    createPost,
    getAllPost
}