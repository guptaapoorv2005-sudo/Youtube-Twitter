import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";


const getVideoComments = asyncHandler(async (req,res) => {
    const {videoId, page = 1, limit = 10} = req.query
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const aggregatePipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
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
                            avatar: 1,
                            fullName: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        }
    ]

    const options = {
        page: Number(page),
        limit: Number(limit)
    }

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate(aggregatePipeline),
        options
    )

    return res
    .status(200)
    .json(new ApiResponse(200,comments,"Comments fetched successfully"))
})

const addComment = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const videoExists = await Video.exists({ _id: videoId })
    if (!videoExists) {
        throw new ApiError(404, "Video not found")
    }

    const {content} = req.body
    if(!content?.trim()){
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create(
        {
            content,
            video: videoId,
            owner: req.user._id
        }
    )

    if(!comment){
        throw new ApiError(500, "Error while creating comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(201,comment,"Comment added successfully"))
})

const updateComment = asyncHandler(async (req,res) => {
    const {commentId} = req.params
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const {content} = req.body
    if(!content?.trim()){
        throw new ApiError(400,"Content is required")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            content
        },
        {new: true}
    )

    if(!updatedComment){
        throw new ApiError(404,"Comment not found or unauthorized")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedComment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req,res) => {
    const {commentId} = req.params
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const deletedComment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: req.user._id
        }
    )

    if(!deletedComment){
        throw new ApiError(404, "Comment not found or unauthorized request")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}