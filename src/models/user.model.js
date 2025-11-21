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
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = model("User",userSchema)