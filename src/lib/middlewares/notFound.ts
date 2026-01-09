import { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        error: "Resource not found!!!",
        path: req.originalUrl,
        date: new Date(),

    });
}