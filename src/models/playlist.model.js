import  mongoose, {Schema}  from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSChema = new Schema({
    name:{
        type: String,
        required:true
    },
    discription:{
        type: String,
        
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
            }
    ],

    Creator:{
    type:Schema.Types.ObjectId,
    ref:"User"
    }
},{timestamps:true})

// 'videoSchema.plugin(mongooseAggregatePaginate);' 

export const Playlist = mongoose.model("Playlist" ,playlistSChema)