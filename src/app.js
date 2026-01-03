import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

//app.use() middlewares aur configurations ke liye use hota hai

app.use(cors({
    origin: process.env.CORS_ORIGIN,  
    credentials: true    
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import healthcheckRouter from "./routes/healthcheck.router.js"
import tweetRouter from "./routes/tweet.router.js"

//routes declare
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/tweets",tweetRouter)

export { app }