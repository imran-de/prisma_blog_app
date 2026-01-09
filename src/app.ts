import express, { Application } from 'express';
import { toNodeHandler } from "better-auth/node";
import { postRouter } from './modules/post/post.router';
import { auth } from './lib/auth';
import cors from 'cors';
import { commentRouter } from './modules/comment/comment.router';
import globalErrorHandler from './lib/middlewares/globalErrorHandler';
import { notFoundHandler } from './lib/middlewares/notFound';

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:4000", //client site url
    credentials: true,

}))

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());

app.use("/posts", postRouter)
app.use("/comments", commentRouter)
app.get("/", (req, res) => {
    res.send("Hello World!");
});


// Global Error Handler
app.use(globalErrorHandler);
// 404 Not Found Handler
app.use(notFoundHandler)

export default app;