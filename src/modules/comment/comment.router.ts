import express, { NextFunction, Request, Response } from 'express';
import { commentController } from './comment.controller';
import authMiddleware, { UserRole } from '../../lib/middlewares/auth';

const router = express.Router();


router.post(
    "/",
    authMiddleware(UserRole.User, UserRole.Admin),
    commentController.createComment,
    // You can add authentication middleware here if needed
)
router.get(
    "/:commentId",
    commentController.getCommentById,
)
router.get(
    "/author/:authorId",
    commentController.getCommentByAuthor,
)
router.delete(
    "/:commentId",
    authMiddleware(UserRole.User, UserRole.Admin),
    commentController.deleteComment,
)
router.patch(
    "/:commentId",
    authMiddleware(UserRole.User, UserRole.Admin),
    commentController.updateComment,
);

export const commentRouter = router;