import multer from "multer";

export const multerInstance = multer({
    storage: multer.memoryStorage()
})