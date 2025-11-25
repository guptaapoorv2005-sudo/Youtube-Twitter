import {Router} from "express"
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js"
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

export default router