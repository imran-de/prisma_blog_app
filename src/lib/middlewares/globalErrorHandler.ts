import { NextFunction, Request, Response } from "express"
import { Prisma } from "../../../generated/prisma/client";
import { stat } from "node:fs";

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        return next(err)
    }
    let statusCode = 500;
    let errorMessage = 'Internal Server Error';
    let errorDetails = err;
    // PrismaClientValidationError
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        errorMessage = 'You provide incorrect field type or missing fields';
    }
    // PrismaClientKnownRequestError
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                statusCode = 409;
                errorMessage = 'Unique constraint failed';
                break;
            case 'P2025':
                statusCode = 404;
                errorMessage = 'Record not found';
                break;
            default:
                statusCode = 400;
                errorMessage = 'Database request error';
                break;
        }
    }
    // PrismaClientUnknownRequestError
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 400;
        errorMessage = 'Unknown database error occurred';
    }
    // PrismaClientInitializationError
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        if (err.errorCode === 'P1000') {
            statusCode = 500;
            errorMessage = 'Database connection failed';
        }
        else if (err.errorCode === 'P1001') {
            statusCode = 500;
            errorMessage = 'Database host not found';
        }
    }
    // Custom Application Error
    else if (err.statusCode && err.message) {
        statusCode = err.statusCode;
        errorMessage = err.message;
    }
    res.status(statusCode)
    res.render('error', { error: errorMessage, details: errorDetails });
}
export default errorHandler