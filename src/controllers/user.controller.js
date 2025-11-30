import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import { subscribe } from "diagnostics_channel";
import mongoose from "mongoose";

//TODO: req, res body params ye sab kahan se aa rha hai vo samajhna hai

const registerUser = asyncHandler(async (req,res)=>{
    //steps
    //get user details from frontend
    //validation - not empty
    //check if user already exists
    //upload images to cloudinary
    //create user object- create entry in DB
    //remove password and refresh token field from response
    //check for user creation
    //return response

    const {username, email, password, fullName} = req.body    //req.body mai frontend se aya hua data hota hai

    if(
        [username, email, password, fullName].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    let avatarLocalPath;
    if(req.files?.avatar){
        avatarLocalPath = req.files.avatar[0]?.path           //middleware req mai data bhejta hai
    }       
    // console.log("req.files:  ",req.files)
    let coverImageLocalPath=null;

    if(req.files?.coverImage){
        coverImageLocalPath = req.files.coverImage[0]?.path
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // console.log("existedUser: ",existedUser)
    if(existedUser){
        fs.unlinkSync(avatarLocalPath)
        if(coverImageLocalPath)fs.unlinkSync(coverImageLocalPath)
        throw new ApiError(409,"User with same username or email already exists")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({        //ye method DB mai data entry karne ke baad sara data return karta hai
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(    //object mai se password aur refreshToken remove kar diya
        "-password -refreshToken"
    )

    if(!createdUser){
        fs.unlinkSync(avatarLocalPath)
        if(coverImageLocalPath)fs.unlinkSync(coverImageLocalPath)
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully")
    )
})

const loginUser = asyncHandler(async (req,res)=>{
    //steps
    //data->req.body
    //validate
    //find user in db with username or email
    //if user found, check password
    //if password correct, generate refresh and access tokens
    //save refresh token in db
    //send cookies

    const {username, email, password} = req.body

    if(!username && !email){
        throw new ApiError(200,"Username or email is required")
    }
    if(!password){
        throw new ApiError(200,"Password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(!user){
        throw new ApiError(404, "No user found")
    }
    
    //Jo methods User model mai add kiye the unn methods ko call karne ke liye hume ussi model ka object chahiye
    //"User" ka use karke methods call nhi kar sakte
    //in this case the object is "user"
    //it's like a model is a class with methods and data, which can be accessed only through the objects of that class, a class can't access any methods or data
    
    const passwordCorrect = await user.isPasswordCorrect(password) 
    if(!passwordCorrect){
        throw new ApiError(401, "Password is incorrect")
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken

    await user.save({validateBeforeSave: false})
    /*jab bhi db mai kuch save karte hain, toh save karne se pehle validation active hota hai, aur vo check karta hai ki saari required
    fields bheji hain ya nhi, if u don't want aisa ho toh ye likhdo {validateBeforeSave: false} */

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,  //this line makes sure that only the server can modify these cookies and frontend cannot
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "user logged in successfully")
    )
})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {     //this removes the field from document
                refreshToken: 1
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json( new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorised request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)
    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    }

    if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401, "refresh token is expired or used")
    }

    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()

    user.refreshToken = newRefreshToken
    user.save({validateBeforeSave: false})

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json( new ApiResponse(200, { accessToken, refreshToken: newRefreshToken}, "Access token refreshed"))

})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const { oldPassword, newPassword} = req.body

    if(!oldPassword) throw new ApiError(400, "Current Password is required");
    if(!newPassword) throw new ApiError(400, "New Password is required");

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Password is incorrect")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse( 200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName, email} = req.body
    if(!fullName && !email){
        throw new ApiError(400, "Fullname or email is required")
    }

    let user;

    if(!email){
        user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {fullName}
            },
            {new: true}  //ye line updated object return kar deti hai
        ).select("-password -refreshToken")
    }

    else if(!fullName){
        const existedUser = await User.findOne({email})
        if(existedUser){
            throw new ApiError(400, "Another user with same email already exists")
        }
        user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {email}
            },
            {new: true}
        ).select("-password -refreshToken")
    }

    else{
        const existedUser = await User.findOne({email})
        if(existedUser){
            throw new ApiError(400, "Another user with same email already exists")
        }

        user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    fullName,
                    email
                }
            },
            {new: true}
        ).select("-password -refreshToken")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {avatar: avatar.url}
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage){
        throw new ApiError(400, "Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {coverImage: coverImage.url}
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params  //ye url se aayega toh iske route mai "/:username" likhna padega
    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }

//aggregation pipeline mai hum ek array of objects dete hain, array ka har object ek stage hota hai
//The documents that are output from one stage are passed to the next stage
    const channel = await User.aggregate([
        {
            $match: {               //It takes a condition and returns only those documents that satisfy the condition.
                username: username   //These documents are then passed one by one to the next stage
            }
        },
        {
        /* $lookup Performs a left outer join to a collection(model) in the same database to filter in documents from the foreign 
        collection for processing. The $lookup stage adds a new array field to each input document. The new array field contains the 
        matching documents from the foreign collection. The $lookup stage passes these reshaped documents to the next stage*/
        //kisi bhi model ke ek object ko jisme data filled hota hai usse document boltein hain
            $lookup: {
                from: "subscriptions", //jis collection ko left join karke usme search marna hai uska database vala naam likhna padta hai yahan
                localField: "_id",          //jis field ki value search karni hai dusre collection(model) mai
                foreignField: "channel",    //dusre collection ki jis field se compare karna hai
                as: "subscribers" //lookup iss naam ki ek new field add kar deta hai document mai,jisme ek array of documents found hota h
            }
        /*iss stage mai user ke document mai ek subscribers naam ki field add ho jayegi jisme ek array hoga containing documents(objects)
        with channel(same as the current channel's document's _id) and subscriber */
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        /*iss stage mai ek aur new field named subscribedTo add ho jayegi document mai, jisme ek array hoga containing documents with
        subscriber(same as the current channel's document's _id) and channel */
        },
        {
            $addFields: {       //ye current user document mai new fields add kar dega
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {    //jo fields final document mai rakhni hain unke aage 1 likhde, zyada data bhejna network traffic increase kar deta hai aur memory bhi zyada leta hai toh inefficient ho jata hai
                username: 1,
                email: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])
    //aggregate returns an array containing all the documents formed after all stages
    //iss case mai array ke andar bus ek he document hoga

    if(channel?.length===0){
        throw new ApiError(404, "Channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        //find current user's document
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)  //db mai _id thoda alag tareeke se stored hoti hai 
            }                                                   //toh _id ko mongoose ki help se uss form mai convert karna padta hai
        },
        //find all the documents of the videos the user has watched, by using the video _ids from watchHistory
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",   /*here we are replacing the initial watchHistory field(which contained video _ids) with a new 
                watchHistory field(containing an array of video documents). Note that this won't change anything in the database, we are
                just maiking changes to the copy of the user document we got from the previous stage*/

                //since lookup will add a new field containing an array of video documents found
                //we will first have to find and store the user document(details of owner of video) inside each video document 
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",

                            //before adding the owner's document, we first need to remove the unnecessary fields
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
                    //now the owner field of the video document will have an array which will contain just one element(i.e. owner doucment)
                    //we need to extract the owner document from the array and store it in the owner field
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"   //$first gets the first element of the array 
                            }
                        }
                    }
                ]
            }
        },
        //we don't need the details of the current user here, we just need his watchHistory
        {
            $project: {
                watchHistory: 1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0], "watchHistory fetched successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}