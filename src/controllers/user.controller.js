import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//steps
//get user details from frontend
//validation - not empty
//check if user already exists
//upload images to cloudinary
//create user object- create entry in DB
//remove password and refresh token field from response
//check for user creation
//return response

const registerUser = asyncHandler(async (req,res)=>{
    const {username, email, password, fullName} = req.body    //req.body mai frontend se aya hua data hota hai

    if(
        [username, email, password, fullName].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // console.log("existedUser: ",existedUser)
    if(existedUser){
        throw new ApiError(409,"User with same username or email already exists")
    }

    let avatarLocalPath;
    if(req.files?.avatar){
        avatarLocalPath = req.files.avatar[0]?.path           //middleware req mai data bhejta hai
    }       
    // console.log("req.files:  ",req.files)
    let coverImageLocalPath;

    if(req.files?.coverImage){
        coverImageLocalPath = req.files.coverImage[0]?.path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
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
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully")
    )
})

export {registerUser}