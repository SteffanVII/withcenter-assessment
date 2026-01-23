import { EBlogState, TCreateBlogRequestBody, TGetMyBlogsRequestQuery, TGetPublicBlogRequestParam, TUpdateBlogRequestBody } from "@repo/blog-types";
import { IAuthenticatedPublicRequest, IAuthenticatedRequest } from "../../middlewares/interfaces.js";
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

export interface IDeleteBlogRequest extends IAuthenticatedRequest {
    params : {
        blogId : string
    }
}

export interface IUploadPhotoRequest extends Request {
    file : Express.Multer.File
}

export interface IPostBlogCommentsRequest extends IAuthenticatedPublicRequest {
    body : {
        blogId : string,
        content : string
    }
}

export interface IGetBlogCommentsRequest extends Request {
    params : {
        blogId : string
    }
}

export interface IUpdateBlogCommentRequest extends IAuthenticatedRequest {
    body : {
        commentId : string,
        content : string
    }
}

export interface IDeleteBlogCommentRequest extends IAuthenticatedPublicRequest {
    params : {
        commentId : string
    }
}