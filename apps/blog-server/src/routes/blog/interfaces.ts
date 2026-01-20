import { EBlogState, TCreateBlogRequestBody, TGetMyBlogsRequestQuery, TGetPublicBlogRequestParam, TUpdateBlogRequestBody } from "@repo/blog-types";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { Request } from "express";

// @ts-expect-error
export interface IGetMyBlogsRequest extends IAuthenticatedRequest {
    query : TGetMyBlogsRequestQuery
}

export interface IGetMyBlogRequest extends IAuthenticatedRequest {
    params : {
        blogId : string
    }
}

export interface ICreateBlogRequest extends IAuthenticatedRequest {
    body : TCreateBlogRequestBody
}

export interface IUpdateBlogRequest extends IAuthenticatedRequest {
    body : TUpdateBlogRequestBody
}

export interface IGetPublicBlogRequest extends Request {
    params : TGetPublicBlogRequestParam
}

export interface IUpdateBlogStateRequest extends IAuthenticatedRequest {
    body : {
        blogId : string,
        state : EBlogState
    }
}