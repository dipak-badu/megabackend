import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {

})

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!(title && description)) {
        throw new ApiError(401, "Title and Discription are required");
    }

    const thumnalLocalPath = req.files?.thumbnail?.[0]?.path;
    const videoLocalPath = req.files?.videoFile?.[0]?.path;

    if (!(thumnalLocalPath && videoLocalPath)) {
        throw new ApiError(400, "Thumnail and video local path not found");
    }

    const thumbnail = await uploadOnCloudinary(thumnalLocalPath)
    const videoFile = await uploadOnCloudinary(videoLocalPath);

    if (!(thumbnail && videoFile)) {
        throw new ApiError(400, "Error while uploading in cloudinary");
    }

    const duration = parseFloat(videoFile.duration.toFixed(2)) || 0;

    const video = await Video.create({
        videoFile: videoFile.url || "",
        thumbnail: thumbnail.url || "",
        title,
        description,
        duration,
        owner: req.user?._id

    })

    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video is uploaded sucessfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log("VIDEO ID" , videoId)
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, " Invalid video id ");
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "video is not found")
    }

    return res.status(200)
        .json(new ApiResponse(200, video, "Video  is fetched sucessfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;   // also const videoId = req.params.videoId
    const { title, description } = req.body
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid object id")
    }
    const thumnalLocalPath = req.file?.path;

    if (!(title && description)) {
        throw new ApiError(400, "All fields are required")
    }
    if (!thumnalLocalPath) {
        throw new ApiError(400, "Local file path is requred");
    }

    const thumbnail = await uploadOnCloudinary(thumnalLocalPath);
    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading in cloudinary");
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        $set: {
            title: title,
            thumnail: thumbnail.url,
            description: description
        }


    }, { new: true })

    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video updated sucessfully")
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const videoToDelete = await Video.findByIdAndDelete(videoId)

    if (!videoToDelete) {
        throw new ApiError(400, "NO video to delete")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, videoToDelete, "Video is deleted")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const togglevideoPublishststus = await Video.findByIdAndUpdate(videoId, {
        $set: {
            isPublished: !video.isPublished
        }
    }, { new: true })

    return res.status(200)
        .json(
            new ApiResponse(200, togglevideoPublishststus, "Publish status is toggled successfully")
        )
})

const videoViews = asyncHandler(async(req, res)=>{
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findByIdAndUpdate(videoId,{
        $inc:{
            views:1
        }
    }, {new :true})

    if(!video){
        throw new ApiError(400, "Video is not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, video , "Video is watched ")
    )
})
export {
    uploadVideo,
    updateVideo,
    getVideoById,
    deleteVideo,
    togglePublishStatus,
    videoViews
}