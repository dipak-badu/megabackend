import  mongoose, {Schema}  from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSChema = new Schema({
    content:{
        type:String,
        required:true
    },
    Tweetby:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

// 'videoSchema.plugin(mongooseAggregatePaginate);' 

export const Tweet = mongoose.model("Tweet" ,tweetSChema)