import { Request, Response } from "express";
import { postService } from "./post.service";


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

export const postController = {
    createPost,

}