import { Router } from "express";
import { uploadVideo,
    updateVideo,
    getVideoById,
    deleteVideo,
    togglePublishStatus,
    videoViews

 } from "../controllers/video.controller.js";
 import {upload } from "../middlewares/multer.middleware.js";
 import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);


router.route("/uploadVideo").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount:1
        },
        {
            name: "thumbnail",
            maxCount:1

        }
    ]),
    uploadVideo
)

// router.route("/:getvideo").get(getVideoById)

//    router.route("/deleteVideo") .delete(deleteVideo)
//  router.route("update").patch(upload.single("thumbnail"), updateVideo)
//     router.route("/videoviews").post(videoViews)

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    
    .patch(upload.single("thumbnail"), updateVideo);

    router.route("/views/:videoId").get(videoViews);
    router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
export  default router;