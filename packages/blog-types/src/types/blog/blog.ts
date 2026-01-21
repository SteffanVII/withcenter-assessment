import { Selectable } from "kysely"
import { EBlogState } from "./enums.js"
import { BlogBlog, BlogBlogComment, BlogUserUser } from "../../db.js"
import { TUser } from "../user/user.js"

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

export type TBlogComment = Selectable<BlogBlogComment> & {
    user : Pick<TUser, "email" | "firstname" | "lastname"> | null
}