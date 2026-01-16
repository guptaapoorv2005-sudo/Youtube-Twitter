import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


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



export {
    createPlaylist,
    getUserPlaylists,
}