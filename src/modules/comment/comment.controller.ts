import { Request, Response } from "express";
import { commentService } from "./comment.service";



const createComment = async (req: Request, res: Response) => {
    try {
        const user = req.user; // Assuming user info is attached to req by auth middleware
        req.body.authorId = user?.id; // Set the authorId from authenticated user
        const result = await commentService.createComment(req.body);
        res.status(201).json({
            message: "Comment created successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            message: "Failed to create comment",
            details: error,
        })
    }
}

const getCommentById = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params; // Assuming user info is attached to req by auth middleware

        const result = await commentService.getCommentById(commentId as string);
        res.status(201).json({
            message: "Comment fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            message: "Failed to fetched comment",
            details: error,
        })
    }
}

const getCommentByAuthor = async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params; // Assuming user info is attached to req by auth middleware

        const result = await commentService.getCommentById(authorId as string);
        res.status(201).json({
            message: "Comment fetched successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            message: "Failed to fetched comment",
            details: error,
        })
    }
}

const deleteComment = async (req: Request, res: Response) => {
    try {
        const user = req.user; // Assuming user info is attached to req by auth middleware
        const { commentId } = req.params; // Assuming user info is attached to req by auth middleware
        const result = await commentService.deleteComment(commentId as string, user?.id as string);
        res.status(201).json({
            message: "Comment deleted successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            message: "Failed to delete comment",
            details: error,
        })
    }
}

const updateComment = async (req: Request, res: Response) => {
    try {
        const user = req.user; // Assuming user info is attached to req by auth middleware
        const { commentId } = req.params; // Assuming user info is attached to req by auth middleware
        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string);
        res.status(201).json({
            message: "Comment updated successfully",
            data: result,
        })
    } catch (error) {
        res.status(400).json({
            message: "Failed to update comment",
            details: error,
        })
    }
}
export const commentController = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateComment,
}