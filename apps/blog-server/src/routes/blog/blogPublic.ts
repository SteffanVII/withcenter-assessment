import express, { Request, Response } from "express";
import { IGetPublicBlogRequest } from "./interfaces.js";
import { blogKysely } from "../../postgre/index.js";
import { sql } from "kysely";
import { EBlogState, EDatabaseFunction, TBlog } from "@repo/blog-types";
import { jsonBuildObject } from "kysely/helpers/postgres";

const blogPublicRoute = express.Router()

blogPublicRoute.get(
    "/blogs",
    async ( req : Request, res : Response ) => {

        const {
            page
        } = req.query

        try {

            let blogsCount = await blogKysely.selectFrom( "blog.blog" )
                .select( blogKysely.fn.count("blog.blog.id").as( "total" ) )
                .where( "blog.blog.state", "=", EBlogState.PUBLISHED )
                .executeTakeFirst()

            const blogs : TBlog[] = await blogKysely.selectFrom( "blog.blog" )
                .leftJoin( "blog_user.user", "blog_user.user.id", "blog.blog.user_id" )
                .select( eb => [
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.id)`.as("id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.user_id)`.as("user_id"),
                    "blog.blog.title",
                    "blog.blog.body",
                    "blog.blog.created_at",
                    "blog.blog.last_modified",
                    "blog.blog.state",
                    jsonBuildObject({
                        firstname : eb.ref( "blog_user.user.firstname" ),
                        lastname : eb.ref( "blog_user.user.lastname" ),
                        email : eb.ref( "blog_user.user.email" ),
                    }).as("author")
                ])
                .limit(5)
                .offset(5 * ((Number(page || 1)) - 1))
                .orderBy( "blog.blog.last_modified", "desc" )
                .where( "blog.blog.state", "=", EBlogState.PUBLISHED )
                .execute()

            res.status(200).json([blogs, blogsCount.total])

        } catch (error) {
            console.error(error)
            res.status(500).json({
                message : "Internal Server Error"
            })
        }

    }
)

blogPublicRoute.get(
    "/:blogId",
    async ( req : IGetPublicBlogRequest, res : Response) => {

        const {
            blogId
        } = req.params;

        if ( !blogId ) {
            res.status(400).json({ message : "Blog id is required" })
        }

        try {

            const blog : TBlog = await blogKysely.selectFrom( "blog.blog" )
                .leftJoin( "blog_user.user", "blog_user.user.id", "blog.blog.user_id" )
                .select( eb => [
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.id)`.as("id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.user_id)`.as("user_id"),
                    "blog.blog.title",
                    "blog.blog.body",
                    "blog.blog.created_at",
                    "blog.blog.last_modified",
                    "blog.blog.state",
                    jsonBuildObject({
                        firstname : eb.ref( "blog_user.user.firstname" ),
                        lastname : eb.ref( "blog_user.user.lastname" ),
                        email : eb.ref( "blog_user.user.email" ),
                    }).as("author")
                ])
                .where( "blog.blog.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})` )
                .where( "blog.blog.state", "=", EBlogState.PUBLISHED )
                .executeTakeFirstOrThrow()

            res.status(200).json(blog)

        } catch (error) {
            console.log(error)
            res.status(500)
                .json({
                    message : "Internal Server Error",
                    error : JSON.stringify(error, null, 2)
                })
        }

    }
)

export default blogPublicRoute;