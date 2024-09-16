import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { Blog } from "../models/blog.model.js"
import {isValidObjectId} from "mongoose"


const createNewBlog = asyncHandler(async (req,res)=>{
    const {title,content,category} = req.body 
    if(!title && !content){
        throw new ApiError(400,"Blog must have title and content")
    }

    const postBlog = await Blog.create({
        writer:req.user._id,
        title,
        content,
        category
    })

    if(!postBlog){throw new ApiError(500,"Server error on uploading blog")} 

    return res.status(200).json(new ApiResponse(200,postBlog,"Blog posted successfully"))
})

const getBlogbyId = asyncHandler(async(req,res)=>{
    const {blogId} = req.params
    if(!isValidObjectId(blogId)){throw new ApiError(400,"Invalid blog id")}

    const getBlog = await Blog.findById(blogId)
    if(!getBlog){throw new ApiError(400,"Blog not found in database")}

    return res.status(200).json(new ApiResponse(200,getBlog,"Blog fetched succesfully"))

})

const deleteBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.params

    if(!isValidObjectId(blogId)){
        throw new ApiError(400,"Invalid blog ")
    }

    const findBlog = await Blog.findOne({
        writer:req.user._id,
        _id:blogId
    })
    if(!findBlog){throw new ApiError(400,"Blog not found")}

    const deleteBlog = await Blog.findByIdAndDelete(blogId)
    if(!deleteBlog){throw new ApiError(500,"Server failed to delete the blog")}

    return res.status(200).json(new ApiResponse(200,deleteBlog,"Blog deleted succesfully"))
})

const updateBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.params

    if(!isValidObjectId(blogId)){throw new ApiError(400,"Invalid blog id")}

    const {content,title,category} = req.body 

    if(!content && !title) {throw new ApiError(400,"Blog update not found")
    }

    const findOldBlog = await Blog.findOne({
        writer:req.user._id,
        _id:blogId
    })
    if(!findOldBlog){throw new ApiError(400,"Blog not found to update")} 

    findOldBlog.content = content? content: findOldBlog.content
    findOldBlog.title = title? title: findOldBlog.title
    findOldBlog.category = category? category: findOldBlog.category
    
    const updateBlog = await findOldBlog.save()

    if(!updateBlog){throw new ApiError(500,"Server failed to update blog")} 

    return res.status(200).json(new ApiResponse(200,updateBlog,"Blog updated successfully"))
})

const getAllBlogs = asyncHandler(async(req,res)=>{

   try {
     const allBlog = await Blog.find().populate('writer','username profilePicture')
     if(!allBlog){throw new ApiError(400,"No blog found")}
 
     return res.status(200).json(new ApiResponse(200,allBlog,"All blog fetched successfully"))
   } catch (error) {
        console.error("Something went wrong fetching blogs",error)
   }
})

const getBlogBySearch = asyncHandler(async(req,res)=>{
    const search = req.query.q
    try {
        const querry = {
            $or:[
                {title:{
                    $regex: search, $options:'i'
                }},
                {content:{
                    $regex: search, $options:'i'
                }}
            ]
        }

        const searchResult = await Blog.find(querry).populate('writer','username profilePicture')

        if(!searchResult){throw new ApiError(400,"No blogs found")} 

        return res.status(200).json(new ApiResponse(200,searchResult,"Blog searched successfully"))
    } catch (error) {
        console.log("Error fetching blog by search term",error);
        return res.status(500).json(new ApiResponse(500,null,"Nothing found...."))
    }

})

export {createNewBlog,deleteBlog,updateBlog,getBlogbyId,getAllBlogs, getBlogBySearch}