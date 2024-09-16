import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

const generateAccessRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:true})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating token")
    }
}


const registerUser = asyncHandler(async (req,res)=>{
    const {username,email,password} = req.body
    
    if([username,email,password].some((fields)=>fields?.trim()==="")){
        throw new ApiError(400,"Required fields are empty")
    }

    const registeredUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(registeredUser){
        throw new ApiError(409,"User already registered")
    }

    const profielPicLocalPath = req.files?.profilePicture[0]?.path
    if (!profielPicLocalPath) {
        throw new ApiError(404,"File not found")  
    } 
    
    const profilePicture = await uploadOnCloudinary(profielPicLocalPath)

    if(!profilePicture.url){
        throw new ApiError(500,"Profile picture not uploaded")
    }

    const user = await User.create({
        username,
        email: email.toLowerCase(),
        password,
        profilePicture: profilePicture.url  
    })

    const userCreated = await User.findById(user._id).select("-password -refreshToken")
    if(!userCreated){
        throw new ApiError(500,"Server error while creating new user")
    }

    return res.status(200).json(new ApiResponse(200,userCreated,"User Created successfully"))
})

const loginUser = asyncHandler(async (req,res)=>{
    const {username,email,password} = req.body 

    if(!(username||email)){
        throw new ApiError(400,"Username or email required")
    }
     const user = await User.findOne({
        $and:[{username},{email}]
     })

     if(!user){throw new ApiError(401,"User not registered")}

     const passwordValidation = await user.isPasswordCorrect(password)
     if(!passwordValidation){throw new ApiError(401,"Wrong password")}

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

     const {accessToken,refreshToken} = await generateAccessRefreshToken(user._id)

     const option = {
        httpOnly:true,
        secure:true
     }

     return res.status(200)
     .cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option)
     .json(new ApiResponse(200,
        {
            user: loggedInUser,accessToken,refreshToken
        }
        ,"User logged in successfully"))

})

const logoutUser = asyncHandler(async (req,res)=>{

    await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1
        }
    },{
        new:true
    })

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401,"Invalid refresh token")
        }
        
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token expired")
        }

        const options = {
            httpOnly:true,
            secure:true
        }
        
        const {accessToken,newRefreshToken} = await generateAccessRefreshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(
            200,
            {
                accessToken, 
                refreshToken: newRefreshToken
            },
            "Access token refreshed"
        ))

    } catch (error) {
        throw new ApiError(401,"Invalid refrhes token")
    }
})

const updatePassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body
    const user = await User.findById(req.user._id)
    const checkOldPassword = await user.isPasswordCorrect(oldPassword)
    if(!checkOldPassword){throw new ApiError(401,"Wrong old password")} 


    user.password = newPassword

    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
    
})

const updateProfilePicture = asyncHandler(async(req,res)=>{
    const newProfilePictureLocalPath = req.file?.path 
    if(!newProfilePictureLocalPath){
        throw new ApiError(400,"New Profile picture not found")
    }

    const newProfilePicture = await uploadOnCloudinary(newProfilePictureLocalPath)
    if(!newProfilePicture.url){throw new ApiError(500,"Error uplaoding new profile picture")}

    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            profilePicture: newProfilePicture.url
        }
    },{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Profile picture updated succesfully"))
})

const updateUserDetails = asyncHandler(async(req,res)=>{
    const {email,username} = req.body 
    if(!(email || username)){throw new ApiError(400,"User details not given")}

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                username,
                email:email.toLowerCase()
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"User data updated"))
})

const getUserDetails = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id).select("-password")
    return res.status(200).json(new ApiResponse(200,user,"User details fetched successfully"))
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,updatePassword,updateProfilePicture,updateUserDetails,getUserDetails}