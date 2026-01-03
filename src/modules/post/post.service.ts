import { Post } from "../../../generated/prisma/client";
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

const getAllPost = async (payload: { search: string | undefined, tags: string[] | [] }) => {

    const andConditions: PostWhereInput[] = [];
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
    if (payload.tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: payload.tags as string[],
            }
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