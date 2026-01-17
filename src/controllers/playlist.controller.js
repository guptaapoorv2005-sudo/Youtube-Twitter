import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name?.trim()){
        throw new ApiError(400, "Name of playlist is required")
    }

    const owner = req.user._id

    try {
        const playlist = await Playlist.create({
            name: name.trim(),
            description: description?.trim(),
            owner
        })
        return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"))

    } catch (error) {
        if(error.code === 11000){
            throw new ApiError(409, "Playlist with same name already exists")
        }
        throw error 
    }
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId, limit = 10, cursor} = req.query
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const matchStage = {owner: userId}

    if(req.user._id.toString() !== userId){
        matchStage.isPublic = true
    }

    if(cursor){
        matchStage.createdAt = {$lt: new Date(cursor)}
    }

    const limitNumber = Math.min(Math.max(Number(limit),1),50)

    const playlists = await Playlist.find(matchStage)
        .sort({createdAt: -1})
        .limit(limitNumber)
        .select("name isPublic totalVideos createdAt")

    const nextCursor = playlists.length === limitNumber ? playlists[playlists.length - 1].createdAt : null

    return res
    .status(200)
    .json(new ApiResponse(200, {playlists, nextCursor}, "Playlists fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Inavlid playlist id")
    }
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Inavlid video id")
    }

    const playlistExists = await Playlist.exists({_id: playlistId, owner: req.user._id})
    if(!playlistExists){
        throw new ApiError(404, "Playlist not found or unauthorized request")
    }

    const videoExists = await Video.exists({_id: videoId})
    if(!videoExists){
        throw new ApiError(404, "Video does not exists")
    }

    // TOCTOU bug => Time Of Check - Time Of Use

    //I already checked the ownership of the playlist but while updating the playlist i need to check it again
    /*This is because inn dono kaamo(checking ownership and updating playlist) ke beech agar koi aur API call hoti hai aur vo owner 
    change kar deti hai toh user kisi aur owner ki playlist ko update kar dega*/

    //Therefore, authorization should always be done at write-time.
    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id,
            videos: {$ne: videoId}   //checks if same video already exists in the playlist
        },
        {
            $addToSet: {videos: videoId},  //$addToSet adds videoId to videos only if it doesn't already exists
            $inc: {totalVideos: 1},  //increments totalVideos by 1
        },
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(400, "Video already exists in playlist or unauthorized request")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req,res) => {
    const {playlistId,videoId} = req.params
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Inavlid playlist id")
    }
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Inavlid video id")
    }

    const playlistExists = await Playlist.exists({_id: playlistId, owner: req.user._id})
    if(!playlistExists){
        throw new ApiError(404, "Playlist not found or unauthorized request")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id,
            videos: videoId
        },
        {
            $pull: {videos: videoId}, //$pull removes all elements from an array that match a condition.
            $inc: {totalVideos: -1}
        },
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Video doesn't exists in this playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
}