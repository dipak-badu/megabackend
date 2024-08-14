import { v2 as cloudinary} from "cloudinary"
import { ApiError } from "./ApiErrors.js";
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const delateFromCloudinary = async(filepath)=>{
    try {
        if(!filepath) return null;
        const publicId = extractPublicIdFromUrl(filepath);
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
       throw new ApiError( 500, error?.message);
    }
}


const extractPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    return publicId;
};

export {delateFromCloudinary}