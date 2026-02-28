import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { WatchHistory } from "../models/watchHistory.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";


const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const videoExists = await Video.exists({ _id: videoId })
    if (!videoExists) {
        throw new ApiError(404, "Video not found")
    }

    // upsert: creates a new entry if one doesn't exist, otherwise updates the existing entry's updatedAt timestamp
    const historyEntry = await WatchHistory.findOneAndUpdate(
        { user: req.user._id, video: videoId },
        { user: req.user._id, video: videoId },
        { upsert: true, new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, historyEntry, "Added to watch history"))
})

const removeFromWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const deleted = await WatchHistory.findOneAndDelete({
        user: req.user._id,
        video: videoId
    })

    if (!deleted) {
        throw new ApiError(404, "Video not found in watch history")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Removed from watch history"))
})

const getUserWatchHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query

    const aggregatePipeline = [
        {
            $match: { user: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $sort: { updatedAt: -1 }
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
                    { $unwind: "$owner" },
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "video",
                            as: "comments"
                        }
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "allLikes"
                        }
                    },
                    {
                        $addFields: {
                            commentsCount: { $size: "$comments" },
                            likesCount: { $size: "$allLikes" },
                            likedStatus: {
                                $in: [new mongoose.Types.ObjectId(req.user._id), "$allLikes.likedBy"]
                            },
                            editableStatus: {
                                $eq: ["$owner._id", new mongoose.Types.ObjectId(req.user._id)]
                            }
                        }
                    },
                    {
                        $project: {
                            owner: 1,
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            commentsCount: 1,
                            likesCount: 1,
                            likedStatus: 1,
                            editableStatus: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$video" },
        {
            $project: {
                video: 1,
                watchedAt: "$updatedAt"
            }
        }
    ]

    const history = await WatchHistory.aggregatePaginate(
        WatchHistory.aggregate(aggregatePipeline),
        { page: Number(page), limit: Number(limit) }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, history, "Watch history fetched successfully"))
})

export {
    addToWatchHistory,
    removeFromWatchHistory,
    getUserWatchHistory
}
