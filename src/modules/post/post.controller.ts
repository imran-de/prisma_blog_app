import { Request, Response } from "express";
import { postService } from "./post.service";
import { Post, PostStatus } from "../../../generated/prisma/client";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { get } from "node:http";


const createPost = async (req: Request, res: Response) => {
    // res.send("The post created successfully")
    // console.log(req, res);



    try {
        console.log(req.user); // from middleware
        const user = req.user;
        console.log(user);
        if (!user) {
            return res.status(400).json({
                error: "not permit to action",
            })
        }
        const result = await postService.createPost(req.body, user.id as string);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({
            error: "Post creation failed",
            details: err,
        })
    }
}

const getAllPost = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const searchString = typeof search === 'string' ? search : undefined;
        // tags query param
        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

        /// only accept true/false string
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === 'true'
                ? true
                : req.query.isFeatured === 'false'
                    ? false
                    : undefined
            : undefined;
        // status query param
        const status = req.query.status as PostStatus | undefined;

        // add authorId filter using query param
        const authorId = req.query.authorId as string | undefined;

        /*const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;*/

        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query); // default page=1, limit=10, sortBy='createdAt', sortOrder='desc'

        const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder });
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({
            error: "Post get failed",
            details: err,
        })
    }
}

const getPostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({
                error: "Post ID is required",
            })
        }
        const result = await postService.getPostById(postId);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({
            error: "Post get by id failed",
            details: err,
        })
    }
}

const getMyPosts = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "not permit to action",
            })
        }
        const result = await postService.getMyPosts(user.id as string);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({
            error: "Get my posts fetched failed",
            details: err,
        })
    }
}

const updatePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "not permit to action",
            })
        }
        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({
                error: "Post ID is required",
            })
        }
        const isAdmin = user.role?.includes('Admin');
        const result = await postService.updatePost(postId as string, req.body, user.id as string, isAdmin);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({
            error: "Update post failed",
            details: err,
        })
    }
}

const deletePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "not permit to action",
            })
        }
        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({
                error: "Post ID is required",
            })
        }
        const isAdmin = user.role?.includes('Admin');
        const result = await postService.deletePost(postId as string, user.id as string, isAdmin);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({
            error: "Delete post failed",
            details: err,
        })
    }
}

export const postController = {
    createPost,
    getAllPost,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost,
}