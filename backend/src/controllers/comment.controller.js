import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";


const getVideoComments = asyncHandler(async (req,res) => {
    const { page = 1, limit = 10} = req.query
    const {videoId} = req.params
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const currentUserId = new mongoose.Types.ObjectId(req.user._id)

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
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
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
                    $eq: ["$owner._id",currentUserId]
                }
            }
        },
        {
            $project: {
                content: 1,
                video: 1,
                owner: 1,
                likesCount: 1,
                likedStatus: 1,
                editableStatus: 1,
                createdAt: 1,
            }
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

    const commentObj = comment.toObject() // if we change owner of comment to full object instead of just id, we need to convert it to object first otherwise mongoose will automatically revert it back to id
    commentObj.likesCount = 0
    commentObj.likedStatus = false
    commentObj.editableStatus = true
    commentObj.owner = {
        _id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName,
        avatar: req.user.avatar
    }
    return res
    .status(200)
    .json(new ApiResponse(201,commentObj,"Comment added successfully"))
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
        throw new ApiError(404,"Comment not found or Forbidden request")
    }

    const commentObj = updatedComment.toObject()
    commentObj.likesCount = await Like.countDocuments({comment: updatedComment._id})
    commentObj.likedStatus = await Like.exists({comment: updatedComment._id, likedBy: req.user._id})
    commentObj.editableStatus = true
    commentObj.owner = {
        _id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName,
        avatar: req.user.avatar
    }
    return res
    .status(200)
    .json(new ApiResponse(200,commentObj,"Comment updated successfully"))
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
        throw new ApiError(404, "Comment not found or Forbidden request")
    }

    await Like.deleteMany({comment: deletedComment._id}) // Delete all likes associated with the comment

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