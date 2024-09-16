
// basic structure of app.js

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(express.json())

app.use(express.urlencoded({extended:true, limit:'16kb'}))

app.use(express.static("public"))

app.use(cookieParser())

// routes 

import userRouter from "./routes/user.routes.js"
import blogRouter from "./routes/blog.routes.js"

app.use("/api/users",userRouter)
app.use("/api/blogs",blogRouter)


export {app}