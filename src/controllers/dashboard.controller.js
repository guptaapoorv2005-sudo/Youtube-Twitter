import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/*In skip MongoDB finds the documents with required channel and isPublished: true in O(log n) but after that performs a linear traversal to
 skip documents whereas in scroll it finds the exact starting document in O(log n). */

const getChannelVideos = asyncHandler(async (req,res) => {
    const {channelId, sortBy = "createdAt", sortType = "desc", cursor, limit = 10} = req.query
    if(!channelId || !mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }

    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "No channel found")
    }

    const matchStage = {owner: channelId}

    if(channelId !== req.user._id.toString()){
        matchStage.isPublished = true
    }

    const allowedSortFields = ["createdAt", "views"]
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt"

    const limitNumber = Math.min(Math.max(Number(limit), 1), 10)
    // const pageNumber = Math.max(Number(page), 1)

    // const videos = await Video.find(matchStage)
    //     .sort({ [sortField]: sortType === "asc"? 1 : -1 })
    //     .skip((pageNumber-1)*limitNumber)
    //     .limit(limitNumber)
    //     .select("-owner -description")
    //skip ignores the first N documents and limit restricts the number of documents returned. 
    //Together, they are used to implement pagination, but large skip values can degrade performance.

    //Infinite scroll

    if(cursor){
        if(sortField === "createdAt" && sortType !== "asc"){
            matchStage.createdAt = { $lt: new Date(cursor) }
        }
        else if(sortField === "createdAt" && sortType === "asc"){
            matchStage.createdAt = { $gt: new Date(cursor) }
        }
        else{
            const parsedCursor = JSON.parse(cursor)
            matchStage.$or = [
                {views: {$lt: parsedCursor.lastViews}},
                {views: parsedCursor.lastViews, _id: {$lt: parsedCursor.lastId}}//video model mai compound index banaya hua hai jisme _id:-1 hai
            ]
        }
    }
    /*agar videos ke same views hain as previous video toh mai _id: {$ne: parsedCursor.lastId} isliye nhi kar rha kyunki ese karke 
    necessary nhi hai ki next video document he aaye koi purana video document bhi aa sakta hai jiske views same hain aur _id different
    jo already hum response mai bhej chuke hain */

    const sortStage = sortField === "createdAt" ? {createdAt: sortType === "asc" ? 1 : -1} : {views: -1, _id: -1}
    /*agar sort karne mai 2 videos ke views same hain toh random order mai sort ho jayengi vo videos but we want ki smaller _id vaali 
    baadme aaye taaki nextScroll ko correct lastId mil sake varna baadme same documents repeat hone ka chance hoga isliye we add _id: -1
    to sortStage*/

    const videos = await Video.find(matchStage)
        .sort(sortStage)
        .limit(limitNumber)
        .select("-owner -description")

    let nextCursor;
    if(sortField === "createdAt"){
        nextCursor = videos.length > 0 ? videos[videos.length - 1].createdAt : null
    }
    else{
        nextCursor = videos.length > 0 ? 
            {
                lastViews: videos[videos.length - 1].views,
                lastId: videos[videos.length - 1]._id
            } : null
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {
        videos,
        nextCursor,
        hasMore: videos.length === limitNumber
    }, "Channel videos fetched successfully"))
})

