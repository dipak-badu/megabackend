import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async(req, res, next)=>{
  try {
     const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer " , "");
     if(!token){
      throw new ApiError(404, "Unauthorized request");
  
     }
   
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findOne({ email: decodedToken?.email }).select("-password -refreshToken");
   
    if(!user){
      
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access Token Expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid Access Token");
    } else {
      throw error; // Let asyncHandler handle it
    }
  }
   
})