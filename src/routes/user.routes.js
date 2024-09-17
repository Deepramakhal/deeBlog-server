import {Router} from "express"
import {upload} from "../middlewares/multer.middleware.js"
import  {verfiyJWT} from "../middlewares/auth.middleware.js"
import { loginUser, logoutUser, refreshAccessToken, registerUser, updatePassword, updateProfilePicture, updateUserDetails,getUserDetails } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(
    upload.fields(
        [
            {
                name: "profilePicture",
                maxCount:1
            }
        ]
    ), registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verfiyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verfiyJWT,updatePassword)
router.route("/change-dp").patch(verfiyJWT,upload.single("profilePicture"),updateProfilePicture)
router.route("/change-details").patch(verfiyJWT,updateUserDetails)
router.route("/get-details").get(verfiyJWT,getUserDetails)

export default router