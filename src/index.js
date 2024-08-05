import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: "./env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT ||8000, ()=>{
        console.log(`server is running at port ${process.env.PORT}`)
        app.on('ERROR', (error)=>{
            console.log("Error", error);
            throw(error)
        })
    })
})
.catch((error) =>{
    console.log("MONGO DB connection failed !!!", error);
});






/* 
                                   one approach is this 
        onother approach is make file on db folder and import it in this file and connect to the database


import express from "express";
 const app = express();
(async() => {
    try{
       await mongoose.connect(`${process.env.MONGOBD_URI}/${DB_NAME}`)
       app.on("error", ()=>{
            console.log("ERROR ", error);
            throw(error)
       }
    )
    app.listen(process.env.PORT , ()=>{
        console.log(`App is listening on port ${process.env.PORT}`)
    })
}
    catch(error){
       console.error("ERROE ", error)
       throw(error);
    }
})() */