import { Router } from "express";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import imageServerConfig from "../config/imageServer.js";
const { projectId, bucketName } = imageServerConfig;

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024}
})

const storage = new Storage({
    keyFilename: "./config/imageServerKey.json"
})

const bucket = storage.bucket(bucketName);

// route for uploading an image to google cloud storage
router.post("/upload", upload.single('imgfile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: "No file uploaded"});
        }
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream();

        blobStream.on('error', (e) => {throw e});
        blobStream.on('finish', async () => {
            const imgUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
            res.status(200).json({url: imgUrl})
        });
        blobStream.end(req.file.buffer);

    } catch (e) {
        return res.status(500).json({error: e});
    }
});


export default router;