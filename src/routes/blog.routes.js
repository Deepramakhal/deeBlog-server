import {Router} from "express"
import { createNewBlog,deleteBlog,updateBlog,getBlogbyId, getBlogBySearch, getAllBlogs } from "../controllers/blog.controller.js"
import  {verfiyJWT} from "../middlewares/auth.middleware.js"

const router = Router() 

router.route("/postblog").post(verfiyJWT,createNewBlog);

router.route("/:search").get(getBlogBySearch)

router.route("/:blogId").get(verfiyJWT,getBlogbyId)
router.route("/:blogId").patch(verfiyJWT,updateBlog)
router.route('/:blogId').delete(verfiyJWT,deleteBlog)
router.route("/").get(getAllBlogs)

export default router