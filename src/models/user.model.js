import mongoose, { model, Schema } from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        watchHistory: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: "Video"
            }],
            required: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true  //ye likhne se searching optimize ho jaati hai uss field ki
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        }
    },
    {timestamps: true}
)

//pre ek middleware hai aise aur middleware mongoose ki documentation mai mil jayenge

//pre ke andar ek event aur ek callback dena hota hai, yahan pe save hai event toh koi bhi data save hone se just pehle ye function chalega

//arrow function yahan nhi de sakte kyunki arrow function ke paas current context (this) ka access nhi hota

//mongoose mai next() tab call karte hain jab ek middleware ka kaam ho jata hai, toh next() agle middleware ko execute karne ka signal h
//agar next() call nhi karenge toh mongoose humesha ke liye wait karta rahega uss middleware ke complete hone ka aur hang ho jayega
//async await vaale functions mai next() use karne ki zarurat nhi hoti, vo mongoose khud handle kar leta hai

userSchema.pre("save", async function () {
    if(this.isModified("password")){  //agar user data mai kuch aur change kar rha hai tab bhi ye na challe isliye if condition lagayi h
        this.password = await bcrypt.hash(this.password,10)
    }
})

//schema ke andar khudke methods bhi add kar sakte hain
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

//access token is a short-lived token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//refresh token is a long-lived token
//jab access token expire ho jata hai toh refresh token check karke hum ek naya access token user ko de dete hain, so the user doesn't always has to login 
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

//Jo methods User model mai add kiye hain unn methods ko call karne ke liye hume issi model ka object chahiye
//"User" ka use karke methods call nhi kar sakte
//it's like a model is a class with methods and data, which can be accessed only through the objects of that class
//a class can't access any methods or data

export const User = model("User",userSchema)