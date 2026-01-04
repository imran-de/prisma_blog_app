import express, { NextFunction, Request, Response } from 'express';
import { postController } from './post.controller';
import authMiddleware, { UserRole } from '../../lib/middlewares/auth';

const router = express.Router();


router.get(
    "/",
    postController.getAllPost
)

router.post(
    "/", authMiddleware(UserRole.Admin), postController.createPost
)
router.get(
    "/:id",
    postController.getPostById
)


export const postRouter = router;