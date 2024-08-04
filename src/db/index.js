import mongoose from "mongoose";
import { DB_NAME } from "../constans.js";

const connectDB = async ()=>{
    try {
        const connectionInstant = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n mongoDB connected !! DB Host: ${connectionInstant.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection failed:", error);
      

        
    }
}

export default connectDB;