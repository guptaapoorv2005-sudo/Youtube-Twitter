/*package.json ki script mai kuch extra likha hua hai (-r dotenv/config) uss se index.js run hone se pehle he dotenv import aur config ho jata hai aur 
process.env se kisi bhi file mai environment variables access kar sakte hain*/

import connectDB from './db/index.js';
import { app } from './app.js';

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("error: ",error);
        throw error;
    })
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGO DB connection failed!!!",error)
})



/*
import express from 'express';
const app = express();

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("error: ",error);
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port: ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR: ",error);
        throw error;
    }
})()
*/