import { NextFunction, Request, Response } from "express"
import { IAuthenticatedRequest } from "./interfaces.js"
import { blogKysely } from "../postgre/index.js";
import { sql } from "kysely";
import { EDatabaseFunction } from "@repo/blog-types";


export const verifyBlogAuthor = async ( req : IAuthenticatedRequest, res : Response, next : NextFunction ) => {

    let blogId : string;

    const {
        blogId : blogIdFromParams
    } = req.params || {}

    const {
        blogId : blogIdFromBody
    } = req.body || {}

    const {
        blogId : blogIdFromQuery
    } = req.query || {}

    blogId = blogIdFromParams || blogIdFromBody || blogIdFromQuery;

    if ( !blogId ) {
        res.status(400).json({ message : "blog id need to be provided" })
        return
    }

    const {
        id
    } = req.user

    const blog = await blogKysely.selectFrom( "blog.blog" )
        .selectAll()
        .where( "blog.blog.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})` )
        .where( "blog.blog.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${id})` )
        .executeTakeFirst()

    if ( !blog ) {
        res.status(400).json({ message : "The blog doesn't exists or you are not the owner of the blog you're trying to access or modify" })
        return
    }

    next()

}