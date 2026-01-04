import { Request, Response } from "express";
import { postService } from "./post.service";
import { Post, PostStatus } from "../../../generated/prisma/client";


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

        const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, authorId })
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({
            error: "Post get failed",
            details: err,
        })
    }
}

export const postController = {
    createPost,
    getAllPost,
}