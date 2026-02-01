import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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

    return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const userTweets = await Tweet.find({owner: userId}).sort({createdAt: -1})

    return res
    .status(200)
    .json(new ApiResponse(200,userTweets,"User tweets fetched successfully"))
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
        throw new ApiError(403, "Unauthorized request or invalid tweet id")
    }

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
        throw new ApiError(404, "Tweet not found or unauthorized request")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Tweet deleted successfully"))
})
export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}