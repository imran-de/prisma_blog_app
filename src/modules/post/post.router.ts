import express, { NextFunction, Request, Response } from 'express';
import { postController } from './post.controller';
import authMiddleware, { UserRole } from '../../lib/middlewares/auth';

const router = express.Router();




router.post(
    "/", authMiddleware(UserRole.Admin), postController.createPost
)


export const postRouter = router;