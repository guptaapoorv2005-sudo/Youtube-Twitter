import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/get-channel-videos").get(getChannelVideos)

router.route("/:channelId").get(getChannelStats)

export default router

//routes ka order matter karta hai kyunki express routes ko top to bottom compare karta hai
/*Agar yahan pe router.route("/:channelId") ye route pehle likhte toh GET /dashboard/get-channel-videos request will be interpreted as:
  channelId = "get-channel-videos"*/