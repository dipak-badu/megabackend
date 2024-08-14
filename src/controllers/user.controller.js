import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import { delateFromCloudinary } from "../utils/deleteImageFromCloudinary.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken };


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating  access and refresh token ");
    }
}
// ************************ user Register *********************************** 
const registerUser = asyncHandler(async (req, res) => {

    /*  *****************get user detail from frontend ************************** 
   ***************** validatation (not empty, correct username valid password) ************************** 
   *****************check if user already exists by usename, email ************************** 
   *****************check for images , avatar ************************** 
   ***************** upload them into cloudinary,avatar **************************
   ****************** create user object-create entry in db **************************
   ***************** remove password and refresh token field from response **************************   
   ***************** check for user creation **************************
   ***************** return response**************************  
   */

    //    *****************get user detail from frontend ************************** 
    const { fullname, email, username, password } = req.body
    //  console.log("email", email); 
    //  if(fullname===""){
    //     throw new ApiError(400, "fullname is required"); we can do like this
    //  }

    if (
        [fullname, email, username, password].some((field) =>
            field.trim() === "")
    ) {
        throw new ApiError(400, "All field are required");
    }

    const userExitst = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (userExitst) {
        throw new ApiError(409, "This user already exists ")
    }
    // console.log(req.files) 
    const avatarLoacalPath = req.files?.avatar?.[0]?.path; // check for avatar (this is from multer)
    // const covarImageLocalPath = req.files?.coverImage?.[0]?.path; //check for coverImage  (this is from multer)

    let covarImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        covarImageLocalPath = req.files?.coverImage?.[0]?.path;
    }
    if (!avatarLoacalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLoacalPath)
    const coverImage = await uploadOnCloudinary(covarImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");

    }

    const user = await User.create({
        fullname,
        avatar: avatar.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refereshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user ")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully !!")

    )
})


// *************************** user login ***************************** 
const loginUser = asyncHandler(async (req, res) => {
    // take data from req bopdy
    // ckeck for username or email
    //find the user
    //check password 
    // access and refresh token
    // send cookies 
    //send respond

    const { username, email, password } = req.body
    // console.log(email)
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }

    // find user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // check password
    const isPasswordVaild = await user.isPasswordCorrect(password)
    if (!isPasswordVaild) {
        throw new ApiError(401, "Invalid user credintials")
    }

    // access token and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    // send cookies 

    const logginUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,

    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: logginUser, accessToken, refreshToken
                },
                "user logged In Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findOneAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        },
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true,

    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User Logged Out successfully"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorizes request");
    } try {

        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decodedToken) {
            throw new ApiError(401, "Unauthorizes request")
        }

        const user = User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid token ");
        }

        if (incommingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Token is expired or already used ");

        }
        options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken,
                    refreshToken: newrefreshToken
                },
                    "Access token refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect password");

    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "password is changed successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(
            new ApiResponse(200, req.user, "User is fetched successfully")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email, username } = req.body
    if (!(fullname || email || username)) {
        throw new ApiError(400, "Fields are required")
    }
    const user = User.findByIdAndUpdate(
        req.user?._id, {
        $set: {
            fullname: fullname,
            email: email,
            username: username
        }

    }, { new: true }).select("-password");

    return res.status(200)
        .json(
            new ApiResponse(200, { user }, "Account deatil updated successfully")

        )
})

const updateAvater = asyncHandler(async (req, res) => {
    const avatarLoacalPath = req.file?.path;
    if (!avatarLoacalPath) {
        throw new ApiError(400, "Avatar file is missing ");
    }

    const oldimage = await User.findById(req.user?._id);
    const oldImageURL = oldimage.avatar;

    const avatar = await uploadOnCloudinary(avatarLoacalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading in cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }).select("-password")

    if (!oldImageURL) {
        throw new ApiError(400, "No old image found !!");
    }
    await delateFromCloudinary(oldImageURL);

    return res.status(200)
        .json(
            new ApiResponse(200, user, " avatar is updated successfully")
        )
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLoacalPath = req.file?.path;
    if (!coverImageLoacalPath) {
        throw new ApiError(400, "Avatar file is missing ");
    }
    const oldimage = await User.findById(req.user?._id);
    const oldImageURL = oldimage.coverImage;
    
    const coverImage = await uploadOnCloudinary(coverImageLoacalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading in cloudinary coverImage");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }).select("-password")

    if (!oldImageURL) {
        throw new ApiError(400, "No old image found !!");
    }
    await delateFromCloudinary(oldImageURL);

    return res.status(200)
        .json(
            new ApiResponse(200, user, " Cover image is updated successfully")
        )

})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvater,
    updateCoverImage

};