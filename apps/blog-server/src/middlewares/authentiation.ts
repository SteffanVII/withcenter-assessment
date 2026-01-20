import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv"
import { TJWTPayload } from "../routes/authentication/authentication.js";
import jwt from "jsonwebtoken"
import { IAuthenticatedRequest } from "./interfaces.js";

dotenv.config()

export const authenticateRequestMiddleware = async ( req : Request, res : Response, next : NextFunction ) => {

    const accessToken = req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME];

    if ( !accessToken ) {
        res.status(403).json({ message : "Unauthorize" })
        return
    }

    try {
        const decodedToken = jwt.verify(accessToken, process.env.JSON_WEB_TOKEN_SECRET) as TJWTPayload;
        (req as IAuthenticatedRequest).user = decodedToken;
    } catch (error) {
        res.status(403).json({ message: "Unauthorized" });
        throw error;
    }

    next()

}