import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection error ",error);
        process.exit(1);  //process.exit se pura code execution vaheen end ho jata hai, iske andar 0 likhte hain successful completion
                          //succesfull completion show karne ke liye aur 1 for showing ki kuch error aa gaya and program failed
    }
}

export default connectDB