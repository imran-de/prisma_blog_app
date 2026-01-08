import express, { NextFunction, Request, Response } from 'express';
import { postController } from './post.controller';
import authMiddleware, { UserRole } from '../../lib/middlewares/auth';

const router = express.Router();


router.get(
    "/",
    postController.getAllPost
)

router.post(
    "/", authMiddleware(UserRole.Admin, UserRole.User), postController.createPost
)
router.get(
    "/:id",
    postController.getPostById
)

router.get(
    "/my/posts",
    authMiddleware(UserRole.Admin, UserRole.User),
    postController.getMyPosts
)

router.patch(
    "/:postId",
    authMiddleware(UserRole.Admin, UserRole.User),
    postController.updatePost
)

router.delete(
    "/:postId",
    authMiddleware(UserRole.Admin, UserRole.User),
    postController.deletePost
)
router.get(
    "/stats/all",
    authMiddleware(UserRole.Admin),
    postController.getPostStats
);


export const postRouter = router;