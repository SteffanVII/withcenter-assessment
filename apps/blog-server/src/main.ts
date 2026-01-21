import express, { Router, Response } from "express"
import dotenv from "dotenv"
import { createPostgrePool, createSupabaseClient, createTaskprioKyselyConnection, testPostgreConnection } from "./postgre/index.js";
import authenticationRoute from "./routes/authentication/authentication.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import blogRoute from "./routes/blog/blog.js";
import { authenticateRequestMiddleware } from "./middlewares/authentiation.js";
import blogPublicRoute from "./routes/blog/blogPublic.js";
import multer from "multer";

dotenv.config()

const PORT = process.env.PORT || 5000;

const app = express()

// Supabase connection
createPostgrePool()
createTaskprioKyselyConnection()
createSupabaseClient()
await testPostgreConnection()

app.use(cors({
    origin: ["http://localhost:3000", "https://withcenter-assessment-webapp.onrender.com"],
    credentials: true
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// GET
app.get("/", (_, res: Response) => {
    res.status(200).send("Hello from blog server")
})

const apiRoute = express.Router()
const privateRoute = express.Router()
const publicRoute = express.Router()

privateRoute.use(authenticateRequestMiddleware)
privateRoute.use("/blog", blogRoute)

publicRoute.use("/blog", blogPublicRoute)

apiRoute.use("/auth", authenticationRoute)
apiRoute.use("/private", privateRoute)
apiRoute.use("/public", publicRoute)

app.use("/api", apiRoute)


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
