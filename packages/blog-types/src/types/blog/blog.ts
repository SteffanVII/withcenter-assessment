import { Selectable } from "kysely"
import { EBlogState } from "./enums.js"
import { BlogBlog, BlogUserUser } from "../../db.js"

export type TGetMyBlogsRequestQuery = {
    search? : string,
    page : number,
    display : number
}

export type TCreateBlogRequestBody = {
    title : string,
    body : string,
    state : EBlogState
}

export type TUpdateBlogRequestBody = {
    blogId : string,
    title : string,
    body : string
}

export type TGetPublicBlogRequestParam = {
    blogId : string
}

//--------------------------

export type TMyBlog = Selectable<BlogBlog>

export type TBlog = Selectable<BlogBlog> & {
    author : Pick<Selectable<BlogUserUser>, "firstname" | "lastname" | "email">
}