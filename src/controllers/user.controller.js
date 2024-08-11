import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async(req, res)=>{
    
 /*  *****************get user detail from frontend ************************** 
***************** validatation (not empty, correct username valid password) ************************** 
*****************check if user already exists by usename, email ************************** 
*****************check for images , avatar ************************** 
***************** upload them into cloudinary,avatar **************************
****************** create user object-create entry in db **************************
***************** remove password and refresh token field fro response **************************   
***************** check for user creation **************************
***************** return response**************************  
*/

//    *****************get user detail from frontend ************************** 
 const {fullname,email,username,password} = req.body
 console.log("email", email);
//  if(fullname===""){
//     throw new ApiError(400, "fullname is required"); we can do like this
//  }
   
if(
    [fullname, email, username, password].some((field)=>
    field.trim()==="")
){
    throw new ApiError(400, "All field are required");
}

 const userExitst = User.findOne({
    $or:[{username}, {email}]
})
if(userExitst){
    throw new ApiError(409, "This user already exists ")
}

const avatarLoacalPath = req.files?.avatar[0]?.path; // check for avatar (this is from multer)
const covarImageLocalPath = req.files?.coverImage[0]?.path; //check for coverImage  (this is from multer)

if(!avatarLoacalPath){
    throw new ApiError(400, "Avatar file is required");
}

 const avatar = await uploadOnCloudinary(avatarLoacalPath)
 const coverImage = await uploadOnCloudinary(covarImageLocalPath)

 if(!avatar){
    throw new ApiError(400, "Avatar file is required");

 }

 const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
 })
const createdUser = await User.findById(user._id).select(
    "-password -refereshToken"
)

if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user ")
}

return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered Successfully !!")

)
})

export {registerUser};