import express from "express";

import { UploadFileModel } from "../models/index.js";

 class UploadController {
   create = (req, res) => {

    const userId = req.body.userId;
    const file = req.file;
    const message = req.message;

    if (!file) {
      return res.status(500).json({
        status: "error",
        message: "upload error",
      });
    }

    const fileData = {
      filename: file.filename,
      size: file.size,
      ext: file.mimetype,
      url: file.path,
      user: userId,
      message: message,
    };
    console.log(fileData);
    res.send(fileData);

   };
}
//   delete = (req, res) => {
//     const fileId = req.user._id;
//     UploadFileModel.deleteOne({ _id: fileId }, function (err) {
//       if (err) {
//         return res.status(500).json({
//           status: "error",
//           message: err,
//         });
//       }
//       res.json({
//         status: "success",
//       });
//     });
//   };
// }
//
export default UploadController;
