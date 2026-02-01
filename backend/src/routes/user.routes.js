import {Router} from "express"
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([         //yahan humne multer vala middleware laga diya, register user call karne se pehle images upload ho jayengi
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post( loginUser )

//secured routes
router.route("/logout").post( verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").patch( verifyJWT, changeCurrentPassword)

router.route("/current-user").get( verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)  /*patch is used when we are updating only some fields of an
existing document and do not want to replace the whole object*/
//agar iski jagah post use karenge toh bhi chla jayega but it is a good practise to use patch here

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/update-cover").patch(verifyJWT, upload.single("coverImage") , updateUserCoverImage)

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)

export default router