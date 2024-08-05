import mongoose from "mongoose";
import  jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
     username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
     },
     email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        
     },
     fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
     },
     avatar:{
        type:String, //cloudenary url
        required:true,
        
        
     },
     coverImage:{
        type:String,  // cloudenary url
        
     },
     watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
     ],
     password:{
        type:String,
        required:[true, "password is required"],

     },
     refereshToken:{
        type:String,

     }
        
     
}, {timestamps:true})

            //  mongodb hooks 

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password =  await bcrypt.hash(this.password , 10)
    next();
})

        //    custum method for checking the password and encrypted password 

  userSchema.methods.isPasswordCorrect = async function(password) {
   return await bcrypt.compare(password, this.password)
  }  
  
  userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id:this.email,
            email:this.email,
            username:this.username,
            fullname:this.fullname,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCCESS_TOKEN_EXPIRY
        }
    )
  }
  userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this.email,
            email:this.email,
            username:this.username,
            fullname:this.fullname,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
  }

 export const User = mongoose.model("User", userSchema);