import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import fs from "fs"

const getAllVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query /*url mai ? ke baad jo bhi hota hai vo sab query mai milta
    hai. Yahan req.body isliye use nhi hua kyunki body mai data POST request ke time bhejte hain, ye GET request hai.
    query is used for filtering, searching and pagination. Agar ek specific cheez pe kuch karna ho toh params use karte but idhar
    multiple videos niklani hain isliye we used query.*/

    const matchStage = {}

    if(query){
        matchStage.$and = [
            {
                $or: [
                    {isPublished: true},   //agar video published nhi hai toh bus owner he access kar sakta hai
                    {owner: new mongoose.Types.ObjectId(req.user._id)}
                ]
            },
            {
                $or: [
                    {title: { $regex: query, $options: "i" }},//$regex is used for partial text search and $options modifies how $regex behaves
                    {description: { $regex: query, $options: "i" }} //there are different options, "i" is used for case-insensitive search
                ]
            }
        ]
    }
    else{
        matchStage.$or = [
            {isPublished: true},
            {owner: req.user._id}
        ]
    }

    if(userId){
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId) //userId string hai aur DB mai ObjectId ek object hota hai toh isse convert karna padega
    }
    
    const aggregatePipeline = [
        {
            $match: matchStage
        },
        {
            //$sort uss field ka naam leta hai jiske basis pe sort karna hai aur 1 for ascending order 2 for descending
            $sort: {
                [sortBy]: sortType==="asc"? 1 : -1
                /*sortBy ko [] mai isliye likha hai kyunki agar directly sortBy likhte toh $sort ko lagta ki sortBy ek field hai but
                sortBy ek variable hai jiske andar field ka naam hai, toh aisi cheezon ko JS mai [] ke andar likhte hain aur isko 
                Computed Property Names kaha jata hai */
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
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"  //Converts array field into a single object.
        }
    ]

    const options = {
        page: Number(page),  //page no. which u want to see
        limit: Number(limit) //no. of documents per page
    }

    const videos = await Video.aggregatePaginate(   //aggregatePaginate ek object return karta hai,jisme multiple cheezein hoti hain
        Video.aggregate(aggregatePipeline),         //docs(array of fetched documents), totalDocs, page,totalPages, limit,etc.
        options
    )

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    /* Optional Chaining Operator(?.) existence check karne ke liye hota hai, jaise neeche req ke andar files naam ka kuch nhi mila toh
    ye undefined return kar deta hai */
    /*hume neeche vaale check ko if(req.files?.videoFile?.length === 0) aise check nhi kar sakte kyunkiagar kuch nhi mila toh (?) 
    operator undefined return karega aur phir undefined === 0 check hoga which will be false*/
    if(!req.files?.videoFile?.length){
        throw new ApiError(400, "video file is required")
    }
    const videoLocalPath = req.files.videoFile[0].path

    if(!req.files?.thumbnail?.length){
        throw new ApiError(400, "thumbnail is required")
    }
    const thumbnailLocalPath = req.files.thumbnail[0].path

    const cleanupFiles = () => {
        if (videoLocalPath && fs.existsSync(videoLocalPath)) {  //check if the file exists
            fs.unlinkSync(videoLocalPath)
        }
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) {
            fs.unlinkSync(thumbnailLocalPath)
        }
    }

    if(!title?.trim()){
        cleanupFiles()
        throw new ApiError(400, "title is required")
    }
    if(!description?.trim()){
        cleanupFiles()
        throw new ApiError(400, "description is required")
    }

    const video = await uploadOnCloudinary(videoLocalPath)

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!video){
        throw new ApiError(400, "video upload failed")
    }

    if(!thumbnail){
        throw new ApiError(400, "thumbnail upload failed")
    }

    const publishedVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        owner: req.user._id,
        title,
        description,
        duration: video.duration
    })

    if(!publishedVideo){
        throw new ApiError(500, "Something went wrong while publishing the video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, publishedVideo, "video published successfully"))
})

const getVideoById = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    if(!videoId?.trim()){
        throw new ApiError(400, "video id is missing")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) { //check if the id is a valid mongoDB ObjectId
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
                $or: [
                    {isPublished: true},     //agar video published nhi hai toh bus owner he access kar sakta hai
                    {owner: new mongoose.Types.ObjectId(req.user._id)}
                ]
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
        }
    ])

    if(!video?.length){
        throw new ApiError(404, "Video does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId) //findById accepts string id
    if(!video){
        throw new ApiError(404, "Incorrect video id, no video found")
    }

    //objectId ek object hoti hai toh usse compare karne ke liye string banana padta hai
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Unauthorized request")
    }

    let {title,description} = req.body
    title = title?.trim()
    description = description?.trim()

    const thumbnailLocalPath = req.file?.path

    if(!title && !description && !thumbnailLocalPath){
        throw new ApiError(400, "Atleast one field is required")
    }

    const updateFields = {}

    if(thumbnailLocalPath){
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnail){
            if(fs.existsSync(thumbnailLocalPath)){
                fs.unlinkSync(thumbnailLocalPath)
            }
            throw new ApiError(400, "thumbnail upload failed")
        }
        await deleteFromCloudinary(video.thumbnail)
        updateFields.thumbnail = thumbnail.url
    }

    if(title){
        updateFields.title = title
    }

    if(description){
        updateFields.description = description
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        {new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200,updatedVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "No video found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Unauthorized request")
    }

    await deleteFromCloudinary(video.videoFile)
    await deleteFromCloudinary(video.thumbnail)

    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError(500, "Something went wrong while deleting the video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const updatedVideo = await Video.findOneAndUpdate(
        {_id: videoId, owner: req.user._id},
        [
            {
                $set: {
                    isPublished: { $not: "$isPublished" }
                }
            }
        ],
        {new: true}
    )

    if(!updatedVideo){
        throw new ApiError(403, "Video not found or Unauthorized request")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedVideo,"Publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}