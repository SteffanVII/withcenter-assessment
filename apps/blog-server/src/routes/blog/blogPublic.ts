import express, { Request, Response } from "express";
import { IDeleteBlogCommentRequest, IGetBlogCommentsRequest, IGetPublicBlogRequest, IPostBlogCommentsRequest, IUploadPhotoRequest } from "./interfaces.js";
import { blogKysely, supabaseCliet } from "../../postgre/index.js";
import { sql } from "kysely";
import { EBlogState, EDatabaseFunction, TBlog } from "@repo/blog-types";
import { jsonBuildObject } from "kysely/helpers/postgres";
import { multerInstance } from "../../utils/multer.js";
import { authenticatePublicRequestMiddleware } from "../../middlewares/authentiation.js";

const blogPublicRoute = express.Router()

blogPublicRoute.get(
    "/blogs",
    async (req: Request, res: Response) => {

        const {
            page
        } = req.query

        try {

            let blogsCount = await blogKysely.selectFrom("blog.blog")
                .select(blogKysely.fn.count("blog.blog.id").as("total"))
                .where("blog.blog.state", "=", EBlogState.PUBLISHED)
                .executeTakeFirst()

            const blogs: TBlog[] = await blogKysely.selectFrom("blog.blog")
                .leftJoin("blog_user.user", "blog_user.user.id", "blog.blog.user_id")
                .select(eb => [
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.id)`.as("id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.user_id)`.as("user_id"),
                    "blog.blog.title",
                    "blog.blog.body",
                    "blog.blog.created_at",
                    "blog.blog.last_modified",
                    "blog.blog.state",
                    jsonBuildObject({
                        firstname: eb.ref("blog_user.user.firstname"),
                        lastname: eb.ref("blog_user.user.lastname"),
                        email: eb.ref("blog_user.user.email"),
                    }).as("author")
                ])
                .limit(5)
                .offset(5 * ((Number(page || 1)) - 1))
                .orderBy("blog.blog.last_modified", "desc")
                .where("blog.blog.state", "=", EBlogState.PUBLISHED)
                .execute()

            res.status(200).json([blogs, blogsCount.total])

        } catch (error) {
            console.error(error)
            res.status(500).json({
                message: "Internal Server Error"
            })
        }

    }
)

blogPublicRoute.get(
    "/:blogId",
    async (req: IGetPublicBlogRequest, res: Response) => {

        const {
            blogId
        } = req.params;

        if (!blogId) {
            res.status(400).json({ message: "Blog id is required" })
        }

        try {

            const blog: TBlog = await blogKysely.selectFrom("blog.blog")
                .leftJoin("blog_user.user", "blog_user.user.id", "blog.blog.user_id")
                .select(eb => [
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.id)`.as("id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.user_id)`.as("user_id"),
                    "blog.blog.title",
                    "blog.blog.body",
                    "blog.blog.created_at",
                    "blog.blog.last_modified",
                    "blog.blog.state",
                    jsonBuildObject({
                        firstname: eb.ref("blog_user.user.firstname"),
                        lastname: eb.ref("blog_user.user.lastname"),
                        email: eb.ref("blog_user.user.email"),
                    }).as("author")
                ])
                .where("blog.blog.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})`)
                .where("blog.blog.state", "=", EBlogState.PUBLISHED)
                .executeTakeFirstOrThrow()

            res.status(200).json(blog)

        } catch (error) {
            console.log(error)
            res.status(500)
                .json({
                    message: "Internal Server Error",
                    error: JSON.stringify(error, null, 2)
                })
        }

    }
)

blogPublicRoute.get(
    "/comments/:blogId",
    async ( req : IGetBlogCommentsRequest, res : Response ) => {

        const {
            blogId
        } = req.params

        try {

            const comments = await blogKysely.selectFrom( "blog.blog_comment" )
                .leftJoin( "blog_user.user", "blog_user.user.id", "blog.blog_comment.user_id" )
                .select( eb => [
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog_comment.id)`.as("id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog_comment.user_id)`.as("user_id"),
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog_comment.blog_id)`.as("blog_id"),
                    "blog.blog_comment.content",
                    "blog.blog_comment.created_at",
                    eb.case()
                        .when( "blog.blog_comment.user_id", "is not", null )
                        .then( jsonBuildObject({
                            email : eb.ref( "blog_user.user.email" ),
                            firstname : eb.ref( "blog_user.user.firstname" ),
                            lastname : eb.ref( "blog_user.user.lastname" ),
                        }) )
                        .else( sql<null>`null` )
                        .end()
                        .as("user")
                ] )
                .orderBy( "blog.blog_comment.created_at", "desc" )
                .where("blog.blog_comment.blog_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})`)
                .execute()

            res.status(200).json(comments)

        } catch (error) {
            console.error(error)
            res.status(500)
            .json({
                message : "Internal Server Error",
                error : JSON.stringify(error, null, 2)
            })
        }

    }
)

// POST

blogPublicRoute.post(
    "/upload-image",
    multerInstance.single("image"),
    async (req: IUploadPhotoRequest, res: Response) => {

        const { file } = req;

        try {
            const data = await supabaseCliet.storage.from("blog-images").upload(`${file.originalname}`, file.buffer, {
                upsert : true
            })
            res.status(200).send(`https://iujiemtfrxkedtykfdnd.supabase.co/storage/v1/object/public/${data.data.fullPath}`)
        } catch (error) {
            console.error(error)
            res.status(500).json({
                message: "Internal Server Error",
                error: JSON.stringify(error)
            })
        }


    }
)

blogPublicRoute.post(
    "/comment",
    authenticatePublicRequestMiddleware,
    async ( req : IPostBlogCommentsRequest, res : Response ) => {

        const {
            blogId,
            content
        } = req.body

        const user = req.user

        try {

            const comment = await blogKysely.transaction().execute( async trx => {

                const createdComment = await trx.insertInto( "blog.blog_comment" )
                    .values({
                        blog_id : sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})`,
                        user_id : user?.id ? sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${user.id})` : null,
                        content
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()

                return await trx.selectFrom( "blog.blog_comment" )
                    .leftJoin( "blog_user.user", "blog_user.user.id", "blog.blog_comment.user_id" )
                    .select( (eb) => [
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog_comment.id)`.as("id"),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog_comment.user_id)`.as("user_id"),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog_comment.blog_id)`.as("blog_id"),
                        "blog.blog_comment.content",
                        "blog.blog_comment.created_at",
                        eb.case()
                            .when( "blog.blog_comment.user_id", "is not", null )
                            .then( jsonBuildObject({
                                email : eb.ref( "blog_user.user.email" ),
                                firstname : eb.ref( "blog_user.user.firstname" ),
                                lastname : eb.ref( "blog_user.user.lastname" ),
                            }) )
                            .else( sql<null>`null` )
                            .end()
                            .as("user")
                    ])
                    .where( "blog.blog_comment.id", "=", createdComment.id )
                    .where( "blog.blog_comment.blog_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})` )
                    .executeTakeFirstOrThrow()

            } )

            res.status(200).json(comment)

        } catch (error) {
            console.error(error)
            res.status(500).json({
                message : "Internal Server Error",
                error : JSON.stringify( error, null, 2 )
            })
        }

    }
)

// DELETE
blogPublicRoute.delete(
    "/comment/:commentId",
    authenticatePublicRequestMiddleware,
    async ( req : IDeleteBlogCommentRequest, res : Response ) => {

        const {
            commentId
        } = req.params

        const user = req.user

        if ( !user ) {
            res.status(401)
                .json({
                    message : "Unauthorized",
                    error : "User not authenticated"
                })
            return
        }

        try {
            await blogKysely.transaction().execute( async trx => {

                await trx.deleteFrom( "blog.blog_comment" )
                    .where( "blog.blog_comment.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${commentId})` )
                    .where( "blog.blog_comment.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${user.id})` )
                    .executeTakeFirstOrThrow()

            })
            res.status(200)
                .json({
                    message : "Comment deleted successfully"
                })
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