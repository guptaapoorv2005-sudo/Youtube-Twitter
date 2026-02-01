import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";


const toggleVideoLike = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const videoExists = await Video.exists({_id: videoId})
    if(!videoExists){
        throw new ApiError(404, "No video found")
    }

    const removeLike = await Like.findOneAndDelete(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )

    if(!removeLike){
    /*await Like.create(...) can throw a duplicate key error if two requests hit at the same time, user double-clicks quickly so to 
    handle this we wrap it in try catch*/
    //It is known as race-condition and its error code is 11000
        try {
            await Like.create(
                {
                    video: videoId,
                    likedBy: req.user._id
                }
            )
            return res
            .status(200)
            .json(new ApiResponse(200, {liked: true}, "Video liked successfully"))
        } 
        catch (error) {
            if(error.code === 11000){
                return res
                .status(200)
                .json(new ApiResponse(200, {liked: true}, "Video already liked"))
            }
            throw new ApiError(500, "Internal error while toggling video like")
        }
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{liked: false}, "Video unliked successfully"))
})

const toggleCommentLike = asyncHandler(async (req,res) => {
    const {commentId} = req.params
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const commentExists = await Comment.exists({_id: commentId})
    if(!commentExists){
        throw new ApiError(404, "No comment found")
    }

    const removeLike = await Like.findOneAndDelete(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    )

    if(!removeLike){
        try {
            await Like.create(
                {
                    comment: commentId,
                    likedBy: req.user._id
                }
            )
            return res
            .status(200)
            .json(new ApiResponse(200, {liked: true}, "Comment liked successfully"))
        } 
        catch (error) {
            if(error.code === 11000){
                return res
                .status(200)
                .json(new ApiResponse(200, {liked: true}, "Comment already liked"))
            }
            throw new ApiError(500, "Internal error while toggling comment like")
        }
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{liked: false}, "Comment unliked successfully"))
})

const toggleTweetLike = asyncHandler(async (req,res) => {
    const {tweetId} = req.params
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweetExists = await Tweet.exists({_id: tweetId})
    if(!tweetExists){
        throw new ApiError(404, "No tweet found")
    }

    const removeLike = await Like.findOneAndDelete(
        {
            tweet: tweetId,
            likedBy: req.user._id
        }
    )

    if(!removeLike){
        try {
            await Like.create(
                {
                    tweet: tweetId,
                    likedBy: req.user._id
                }
            )
            return res
            .status(200)
            .json(new ApiResponse(200, {liked: true}, "Tweet liked successfully"))
        } 
        catch (error) {
            if(error.code === 11000){
                return res
                .status(200)
                .json(new ApiResponse(200, {liked: true}, "Tweet already liked"))
            }
            throw new ApiError(500, "Internal error while toggling tweet like")
        }
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{liked: false}, "Tweet unliked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",

                pipeline: [
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
                        $project: {
                            thumbnail: 1,
                            owner: 1,
                            title: 1,
                            duration: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project: {
                video: 1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}