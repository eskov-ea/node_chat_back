import  multer from "multer";
import path from "path";

let storage = multer.diskStorage({
    destination: 'uploads',
    filename: function (req, file, cb) {
        const filename = path.basename(file.originalname, path.extname(file.originalname));
        cb(null, filename + '_' + Date.now() + path.extname(file.originalname))
    }
});

const uploader = multer({ storage }).single('file');

export default uploader;
