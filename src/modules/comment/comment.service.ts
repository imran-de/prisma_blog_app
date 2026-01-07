import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"



const createComment = async (payload: {
    postId: string,
    authorId: string,
    content: string,
    parentId?: string,
}) => {
    // Validate that the post exists
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId,
        }
    });
    // If parentId is provided, validate that the parent comment exists
    if (payload.parentId) {
        await prisma.comments.findUniqueOrThrow({
            where: {
                id: payload.parentId,
            }
        });
    }
    // Implementation for creating a comment
    const result = await prisma.comments.create({
        data: payload,
    })
    return result;
}

const getCommentById = async (commentId: string) => {
    const result = await prisma.comments.findUnique({
        where: {
            id: commentId,
        },
        include: {
            post: {
                select: { title: true, id: true, views: true }
            },
        },
    });
    return result;
}

const getCommentByAuthor = async (authorId: string) => {
    const result = await prisma.comments.findMany({
        where: {
            authorId: authorId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            post: {
                select: { title: true, id: true, views: true }
            },
        },
    });
    return result;
}

const deleteComment = async (commentId: string, userId: string) => {
    const result = await prisma.comments.delete({
        where: {
            id: commentId,
            authorId: userId,
        },
    });
    return result;
}

const updateComment = async (commentId: string, data: { content?: string, status?: CommentStatus }, userId: string) => {
    const result = await prisma.comments.update({
        where: {
            id: commentId,
            authorId: userId,
        },
        data: data,
    });
    return result;
}

const moderateComment = async (commentId: string, data: { status: CommentStatus }) => {
    // Ensure the comment exists
    const commentData = await prisma.comments.findUniqueOrThrow({
        where: {
            id: commentId,
        },
        select: { id: true, status: true },
    });

    if (commentData.status === data.status) {
        throw new Error(`Comment is already in the desired status (${data.status})`);
    }
    // Update the comment status
    const result = await prisma.comments.update({
        where: {
            id: commentId,
        },
        data: {
            status: data.status,
        },
    });
    return result;
}
export const commentService = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateComment,
    moderateComment,
}