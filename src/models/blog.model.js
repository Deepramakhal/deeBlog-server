import mongoose,{Schema} from "mongoose"

const blogModel = new Schema(
    {
        writer: {
            type: Schema.Types.ObjectId,
            ref:"User",
            required:[true,"User must logged in to post blog"]
        },
        content: {
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        category:{
            type:String,
            required:true
        }
    },
    {timestamps:true}
)

export const Blog = mongoose.model("Blog",blogModel)