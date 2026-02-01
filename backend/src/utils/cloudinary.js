import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        });
        // console.log("File uploaded to cloudinary ",response)
        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath)
        }
        return response
    } catch (error) {
        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath)
        } //remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

const getPublicIdFromUrl = (url) => {  // we need public_id to delete a file from cloudinary
    if (!url) return null

    // Example URL:
    // https://res.cloudinary.com/demo/video/upload/v1691234567/videos/abc123.mp4

    const parts = url.split("/upload/")
    if (parts.length !== 2) return null

    const pathWithVersion = parts[1]   // v1691234567/videos/abc123.mp4
    const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, "")
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "")

    return publicId
}

const deleteFromCloudinary = async (fileUrl) => {
    try{
        if (!fileUrl) return null

        const publicId = getPublicIdFromUrl(fileUrl)
        if (!publicId) return null

        const isVideo = fileUrl.includes("/video/")  //check if the file to be deleted is a video or not

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: isVideo? "video" : "image"
        })

        return result
    }
    catch(error){
        console.error("Cloudinary delete failed:", error)
        return null
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}