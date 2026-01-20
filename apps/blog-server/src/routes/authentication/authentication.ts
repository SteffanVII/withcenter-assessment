import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { blogKysely } from "../../postgre/index.js";
import { sql } from "kysely";
import { ILoginRequest, IRegisterRequest } from "./interfaces.js";
import { hashPassword, verifyPassword } from "../../utils/passwordHash.js";
import { EDatabaseFunction } from "@repo/blog-types";
import dotenv from "dotenv"

dotenv.config()

export type TJWTPayload = {
    id: string,
    email: string,
}

const accessTokenCookieName = process.env.ACCESS_TOKEN_COOKIE_NAME || "access_token"
const jwtSecret = process.env.JSON_WEB_TOKEN_SECRET

const authenticationRoutes = Router()

authenticationRoutes.post("/", async (req: Request, res: Response) => {

    const accessToken = req.cookies[accessTokenCookieName];

    if (!accessToken) {
        res.status(403).json({
            message: "You're not authenticated"
        })
    }

    try {
        const parsedAccessToken = jwt.verify(accessToken, jwtSecret) as TJWTPayload;

        const user = await blogKysely.selectFrom("blog_user.user")
            .select([
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(blog_user.user.id)`.as("id"),
                "blog_user.user.email",
                "blog_user.user.firstname",
                "blog_user.user.lastname",
            ])
            .where("blog_user.user.id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${parsedAccessToken.id})`)
            .executeTakeFirstOrThrow()

        if (!user) {
            res.status(403).json({ message: "User not found" })
            return
        }

        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(403).json({ message: "Unauthorized" })
    }
})

authenticationRoutes.post("/register", async (req: IRegisterRequest, res: Response) => {

    const {
        email,
        firstname,
        lastname,
        password
    } = req.body

    try {

        const emailExists = await blogKysely.selectFrom( "blog_user.user" )
            .selectAll()
            .where( "blog_user.user.email", "=", email )
            .executeTakeFirst()

        if ( !!emailExists ) {
            res.status(409).json({ message : "This email is already being used." })
            return
        }

        const hashedPassword = await hashPassword(password)

        const createdUser = await blogKysely.transaction().execute( async trx => {

            return await trx.insertInto( "blog_user.user" )
                .values({
                    email : email,
                    firstname : firstname,
                    lastname : lastname,
                    password_hashed : hashedPassword
                })
                .returning([
                    sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(id)`.as("id"),
                    "blog_user.user.email",
                    "blog_user.user.firstname",
                    "blog_user.user.lastname"
                ])
                .executeTakeFirstOrThrow()

        } )

        if ( !!createdUser ) {
            const accessToken = jwt.sign(
                {
                    email,
                    id : createdUser.id
                },
                jwtSecret
            )
            console.log( "User created", JSON.stringify(createdUser, null, 2) )
            res.status(201)
                .cookie(
                    accessTokenCookieName,
                    accessToken,
                    {
                        httpOnly: true,
                        sameSite: "none",
                        secure: true,
                        maxAge: 1000 * 60 * 60 * 24 * 365 * 10
                    }
                )
                .json({
                    message : "User successfully registered",
                    user : createdUser
                })
        } else {
            res.status(500).json({ message : "Failed to create user" })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message : "Internal Server Error", error : error })
    }

})

authenticationRoutes.post("/login", async (req: ILoginRequest, res: Response) => {

    const {
        email,
        password
    } = req.body

    try {
        const user = await blogKysely.selectFrom( "blog_user.user" )
            .select([
                sql<string>`${sql.raw(EDatabaseFunction.UUID_TO_BASE64)}(id)`.as("id"),
                "blog_user.user.email",
                "blog_user.user.firstname",
                "blog_user.user.lastname",
                "blog_user.user.password_hashed"
            ])
            .where( "blog_user.user.email", "=", email )
            .executeTakeFirst()

        if ( !user ) {
            res.status(401).json({
                message : "Email is currently not registered to an account"
            })
        }

        const verifiedPassword = await verifyPassword(password, user.password_hashed)

        if ( verifiedPassword ) {

            const accessToken = jwt.sign({
                email : user.email,
                id : user.id
            }, jwtSecret)

            res.status(200)
            .cookie(
                accessTokenCookieName,
                accessToken,
                {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 1000 * 60 * 60 * 24 * 365 * 10
                }
            )           
            .json({
                id : user.id,
                email : user.email,
                firstname : user.firstname,
                lastname : user.lastname
            })

        }


    } catch (error) {
        console.log(error)
        res.status(500).json({ message : "Internal Server Error" })
    }

})

authenticationRoutes.post( "/logout", async ( _, res : Response ) => {
    res.status(200).clearCookie(
        accessTokenCookieName,
        {
            httpOnly: true,
            sameSite: "none",
            secure: true
        }
    )
    .json({
        message : "Logged Out"
    })
} )

export default authenticationRoutes;