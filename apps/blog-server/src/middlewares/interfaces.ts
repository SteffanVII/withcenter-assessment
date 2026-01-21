import { TJWTPayload } from "../routes/authentication/authentication.js";
import { Request } from "express";

export interface IAuthenticatedRequest extends Request {
    user : TJWTPayload
}

export interface IAuthenticatedPublicRequest extends Request {
    user? : TJWTPayload
}