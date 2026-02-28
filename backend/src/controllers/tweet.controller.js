import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";


const createTweet = asyncHandler(async (req,res) => {
    const {content} = req.body
    if(!content?.trim()){
        throw new ApiError(400, "Content cannot be empty")
    }

    const tweet = await Tweet.create({
        owner: req.user._id,
        content
    })
    if(!tweet){
        throw new ApiError(500, "Internal server error")
    }

    tweet.likesCount = 0
    tweet.likedStatus = false
    tweet.editableStatus = true
    return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const updateTweet = asyncHandler(async (req,res) => {
    const {tweetId} = req.params
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const {content} = req.body
    if(!content?.trim()){
        throw new ApiError(400, "content is required")
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user._id
        },
        {
            $set: {content}
        },
        {new: true}
    )

    if(!updatedTweet){
        throw new ApiError(403, "Forbidden request or invalid tweet id")
    }

    updatedTweet.likesCount = await Like.countDocuments({tweet: updatedTweet._id})
    updatedTweet.likedStatus = await Like.exists({tweet: updatedTweet._id, likedBy: req.user._id})
    updatedTweet.editableStatus = true
    return res
    .status(200)
    .json(new ApiResponse(200,updatedTweet,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req,res) => {
    const {tweetId} = req.params
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const deleted = await Tweet.findOneAndDelete(
        {
            _id: tweetId,
            owner: req.user._id
        }
    )

    if(!deleted){
        throw new ApiError(404, "Tweet not found or Forbidden request")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Tweet deleted successfully"))
})

const getAllTweets = asyncHandler(async (req,res) => {
    const {userId, limit = 10, cursor} = req.query

    const parsedLimit = Number.parseInt(limit, 10)
    if(Number.isNaN(parsedLimit)){
        throw new ApiError(400, "Invalid limit value")
    }
    const limitNumber = Math.min(Math.max(parsedLimit,1),50)
    
    const matchStage = {}
    if(cursor){
        const [cursorDateStr, cursorId] = cursor.split("_")
        const cursorDate = new Date(cursorDateStr)
        if(Number.isNaN(cursorDate.getTime()) || !cursorId || !mongoose.Types.ObjectId.isValid(cursorId)){
            throw new ApiError(400, "Invalid cursor value")
        }
        matchStage.$or = [
            {createdAt: {$lt: cursorDate}},
            {createdAt: cursorDate, _id: {$lt: new mongoose.Types.ObjectId(cursorId)}}
        ]
    }

    if(userId){
        if(!mongoose.Types.ObjectId.isValid(userId)){
            throw new ApiError(400, "Invalid user id")
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    const currentUserId = new mongoose.Types.ObjectId(req.user._id)

    const tweets = await Tweet.aggregate([
        {
            $match: matchStage
        },
        {
            $sort: {createdAt: -1, _id: -1}
        },
        {
            $limit: limitNumber
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",

                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "allLikes"
            }
        },
        {
            $addFields: {
                likesCount: {$size: "$allLikes"},
                likedStatus: {
                    $in: [currentUserId, "$allLikes.likedBy"]
                },
                editableStatus: {
                    $eq: ["$owner._id", currentUserId]
                }
            }
        },
        {
            $project: {
                owner: 1,
                content: 1,
                createdAt: 1,
                likesCount: 1,
                likedStatus: 1,
                editableStatus: 1
            }
        }
    ])

    const lastTweet = tweets[tweets.length - 1]
    const nextCursor = tweets.length === limitNumber
        ? `${lastTweet.createdAt.toISOString()}_${lastTweet._id}`
        : null
    return res
        .status(200)
        .json(new ApiResponse(200, {tweets, nextCursor}, "Tweets fetched successfully"))
})
export {
    createTweet,
    updateTweet,
    deleteTweet,
    getAllTweets
}