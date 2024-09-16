import mongoose,{ Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const userModel = new Schema({
    username:{
        type: String,
        required: [true, "Username is must"],
        unique: true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:[true,"Password is must"],
    },
    profilePicture: {
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

userModel.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userModel.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userModel.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this.id,
        email:this.email,
        username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userModel.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userModel)