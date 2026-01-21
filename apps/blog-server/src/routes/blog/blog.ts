import express, { Response } from "express"
import { ICreateBlogRequest, IDeleteBlogRequest, IGetMyBlogRequest, IGetMyBlogsRequest, IUpdateBlogRequest, IUpdateBlogStateRequest } from "./interfaces.js"
import { blogKysely } from "../../postgre/index.js"
import { sql } from "kysely"
import { EDatabaseFunction, TMyBlog } from "@repo/blog-types"
import { verifyBlogAuthor } from "../../middlewares/authorization.js"

const blogRoute = express.Router()

blogRoute.get("/", async () => {
    
})

blogRoute.get("/my-blog/:blogId", async ( req : IGetMyBlogRequest, res : Response ) => {

    const {
        blogId
    } = req.params

    const {
        id
    } = req.user

    try {

        const blog = await blogKysely.selectFrom( "blog.blog" )
            .select([
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.id)`.as("id"),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.user_id)`.as("user_id"),
                "blog.blog.title",
                "blog.blog.body",
                "blog.blog.created_at",
                "blog.blog.last_modified",
                "blog.blog.state"
            ])
            .where( "blog.blog.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})` )
            .where( "blog.blog.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${id})` )
            .executeTakeFirstOrThrow()

        res.status(200).json(blog)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message : "Internal Server Error",
            error : JSON.stringify(error, null, 2)
        })
    }

})

blogRoute.get("/my-blogs", async ( req : IGetMyBlogsRequest, res : Response ) => {

    const {
        search,
        page,
        display
    } = req.query

    const { id } = req.user

    try {

        console.log("User Id", id);
        

        let myBlogsCountQuery = blogKysely.selectFrom( "blog.blog" )
            .select( blogKysely.fn.count("blog.blog.id").as( "total" ) )
            .where( "blog.blog.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${id})` )

        let myBlogsQuery = blogKysely.selectFrom( "blog.blog" )
            .select([
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.id)`.as("id"),
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.blog.user_id)`.as("user_id"),
                "blog.blog.title",
                "blog.blog.body",
                "blog.blog.created_at",
                "blog.blog.last_modified",
                "blog.blog.state",
            ])
            .limit(display)
            .offset(display * (page - 1))
            .orderBy( "blog.blog.last_modified", "desc" )
            .where( "blog.blog.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${id})` )

        if ( search ) {
            myBlogsCountQuery = myBlogsCountQuery.where( eb => eb.or([
                eb( "blog.blog.title", "ilike", `%${search}%` ),
                eb( "blog.blog.body", "ilike", `%${search}%` )
            ]) )
            myBlogsQuery = myBlogsQuery.where( eb => eb.or([
                eb( "blog.blog.title", "ilike", `%${search}%` ),
                eb( "blog.blog.body", "ilike", `%${search}%` )
            ]) )
        }
    
        const myBlogsCount = await myBlogsCountQuery.executeTakeFirst()
        const myBlogs : TMyBlog[] = await myBlogsQuery.execute()

        res.status(200).json([myBlogs, myBlogsCount.total])
    } catch (error) {
        console.log(error)
        res.status(500).json({ message : "Internal Server Error" })
    }

})

// POST
blogRoute.post(
    "/create",
    async ( req : ICreateBlogRequest, res : Response ) => {

        const {
            title,
            body,
            state
        } = req.body;

        const userId = req.user.id

        if ( !title ) {
            res.status(400).json({ message : "Blog title is required" })
            return
        }

        if ( !body ) {
            res.status(400).json({ message : "Blog body is required" })
            return
        }

        try {
            const createdBlog = await blogKysely.transaction().execute( async trx => {
                
                const blog = await trx.insertInto( "blog.blog" )
                    .values( eb => ({
                        user_id : eb.val(sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${userId})`),
                        title,
                        body,
                        state
                    }))
                    .returning([
                        "blog.blog.body",
                        "blog.blog.title",
                        "blog.blog.state",
                        "blog.blog.created_at",
                        "blog.blog.last_modified",
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.id)`.as("id"),
                        sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog.user_id)`.as("user_id")
                    ])
                    .executeTakeFirstOrThrow()
    
                return blog;
    
            } )
    
            res.status(201).json(createdBlog)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message : "Internal Server Error" })
        }

    }
)

// PATCH
blogRoute.patch(
    "/",
    verifyBlogAuthor,
    async ( req : IUpdateBlogRequest, res : Response ) => {

        const {
            blogId,
            title,
            body
        } = req.body;

        const {
            id
        } = req.user;

        try {

            if ( !title && !body ) {
                res.status(400).json({ message : "At least a title and body update is required" })
                return
            }

            await blogKysely.transaction().execute( async trx => {

                await trx.updateTable( "blog.blog" )
                    .$if( !!title, qb => qb.set({title : title}) )
                    .$if( !!body, qb => qb.set({body : body}) )
                    .where( "blog.blog.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})` )
                    .where( "blog.blog.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${id})` )
                    .executeTakeFirstOrThrow()

            } )

            res.status(200).json({ message : "Blog updated" })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message : "Internal Server Error", error : JSON.stringify(error, null, 2) })
        }

    }
)

blogRoute.patch(
    "/state",
    verifyBlogAuthor,
    async ( req : IUpdateBlogStateRequest, res : Response ) => {

        const {
            blogId,
            state
        } = req.body

        const {
            id
        } = req.user

        if ( !state ) {
            res.status(400).json({ message : "State is required" })
        }

        try {

            await blogKysely.transaction().execute( async trx => {
                await trx.updateTable( "blog.blog" )
                    .set({
                        state : state
                    })
                    .where( "blog.blog.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})` )
                    .where( "blog.blog.user_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${id})` )
                    .executeTakeFirstOrThrow()
            } )

            res.status(200).json({ message : "Blog state updated" })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message : "Internal Server Error",
                error : JSON.stringify( error, null, 2 )
            })
        }

    }
)

// DELETE
blogRoute.delete(
    "/:blogId",
    verifyBlogAuthor,
    async ( req : IDeleteBlogRequest, res : Response ) => {

        const {
            blogId
        } = req.params

        try {

            await blogKysely.transaction().execute( async trx => {
                await trx.deleteFrom( "blog.blog" )
                    .where( "blog.blog.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${blogId})` )
                    .executeTakeFirstOrThrow()
            } )

            res.status(200).json({ message : "Blog deleted" })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message : "Internal Server Error",
                error : JSON.stringify(error)
            })
        }

    }
)

export default blogRoute;