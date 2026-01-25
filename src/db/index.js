import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'
import { syncCriticalIndexes } from '../utils/syncIndexes.js';

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`)

        if(process.env.NODE_ENV === "development"){
            //syncIndexes() sirph 1 baar run karna hota hai jab humne kisi schema mai koi index update kiya h
            //taaki vo change database mai bhi reflect ho jaye
            //isliye har baar jab server start hoga toh syncIndexes() run karne se performance degrade ho rha h
            //therefore we gate it(conditional execution) and run it only during development
            await syncCriticalIndexes()
            console.log("Critical indexes synced")
        }
    } catch (error) {
        console.log("MONGODB connection error ",error);
        process.exit(1);  //process.exit se pura code execution vaheen end ho jata hai, iske andar 0 likhte hain successful completion
                          //0 succesfull completion show karne ke liye aur 1 for showing ki kuch error aa gaya and program failed
    }
}

export default connectDB