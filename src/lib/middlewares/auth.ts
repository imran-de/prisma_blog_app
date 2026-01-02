import { NextFunction, Request, Response } from "express"

import { auth as betterAuth } from '../auth';

export enum UserRole {
    User = "User",
    Admin = "Admin"
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
                email: string
                name: string
                role: string
                emailVerified: boolean
            }
        }
    }
}
// middleware for checking route or functionality access
const authMiddleware = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        //get user session
        try {
            const session = await betterAuth.api.getSession({
                headers: req.headers as any
            })
            // console.log(session);
            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "Your are not permit to do this action!!!",
                })
            }
            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Your email need to verify first before this action!!",
                })
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified,
            }

            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this action!",
                })
            }


            next();
        } catch (err) {
            next(err)
        }
    }
}

export default authMiddleware;