
import express from "express";
import {Socket} from "socket.io";
import { UploadFileModel } from "../models/index.js";

import { MessageModel, DialogModel } from "../models/index.js";

const DOMAIN = 'https://web-notifications.ru/';

class MessageController {

  constructor(io) {
    this.io = io;
  }

  updateReadStatus = (res, userId, dialogId) => {
    MessageModel.updateMany(
        { dialog: dialogId, user: { $ne: userId } },
        { $set: { read: true } },
        (err) => {
          if (err) {
            res.status(500).json({
              status: "error",
              message: err,
            });
          } else {
            this.io.emit("SERVER:MESSAGES_READED", {
              userId,
              dialogId,
            });
          }
        }
    );
  };

  index = (req, res) => {
    const dialogId = req.query.dialog;
    const userId = req.query._id;
    this.updateReadStatus(res, userId, dialogId);

    MessageModel.find({ dialog: dialogId })
        // .sort({"updatedAt": -1})
        .populate(["dialog", "user", "attachments"])
        .sort({"createdAt": -1})
        .exec(function (err, messages) {
          if (err) {
            return res.status(404).json({
              status: "error",
              message: "Messages not found",
            });
          }
          res.json(messages);
        });
    this.io.emit("SERVER:UPDATE_STATUS", dialogId);
  };

  create = (req, res) => {
    const userId = req.body.userId;
    const file = req.file;
    let fileData;
    let fileDataId;
    if (file) {
      fileData = {
        filename: file.filename,
        size: file.size,
        ext: file.mimetype,
        url: DOMAIN + file.path,
        user: userId,
      };
      const uploadFile = new UploadFileModel(fileData);
console.log(fileData);
     fileDataId = uploadFile._id;

      uploadFile
          .save()
	  .then((obj) => {
	    fileDataId = obj._id;
	  })
          .catch(err => {
            res.status(400).json({
              status: "error",
              message: err
            });
          })
    }


    const postData = {
      text: req.body.text,
      dialog: req.body.dialog_id,
      attachments: fileDataId,
      user: userId,
      replyedText: req.body.replyedText,
      replyedMessageId: req.body.replyedMessageId,
      replyedPartnerName: req.body.replyedPartnerName
    };
console.log(postData);
    const message = new MessageModel(postData);

    this.updateReadStatus(res, userId, req.body.dialog_id);

    message
        .save()
        .then((obj) => {
          obj.populate(
              "dialog user attachments",
              (err, message) => {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                DialogModel.findOneAndUpdate(
                    { _id: postData.dialog },
                    { lastMessage: message._id },
                    { upsert: true },
                    function (err) {
                      if (err) {
                        return res.status(500).json({
                          status: "error",
                          message: err,
                        });
                      }
                    }
                );

                res.json(message);
                //console.log(this.io.clients[message.dialog.partner]);
                // (this.io.clients[message.dialog.partner]).emit("SERVER:NEW_MESSAGE", message);
                this.io.emit("SERVER:NEW_MESSAGE", message);
              }
          );
        })
        .catch((reason) => {
          res.json(reason);
        });
  };

  delete = (req, res) => {
    const id = req.body.messageId;
    const userId = req.body.userId;
    MessageModel.findById(id, (err, message) => {
      if (err || !message) {
        return res.status(404).json({
          status: "error",
          message: "Message not found",
        });
      }

      if (message.user.toString() === userId) {
        const dialogId = message.dialog;
        message.remove();

        MessageModel.find(
            { dialog: dialogId },
            null,
            { sort: { createdAt: -1 }, limit: 1 },
            (err, lastMessage) => {
              if (err) {
                res.status(500).json({
                  status: "error",
                  message: err,
                });
              }

              DialogModel.findById(dialogId, (err, dialog) => {
                if (err) {
                  res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                if (!dialog) {
                  return res.status(404).json({
                    status: "not found",
                    message: err,
                  });
                }
                dialog.lastMessage = lastMessage ? lastMessage[0] : "";
                dialog.save();
		if ( lastMessage[0]._id.toString() !== dialog.lastMessage.toString() ) {
		    this.io.emit("SERVER:DELETE_LAST_MESSAGE", "Last message deleted");
		}
              });
            }
        );

        return res.json({
          status: "success",
          message: "Message deleted",
        });
      } else {
        return res.status(403).json({
          status: "error",
          message: "Not have permission",
        });
      }
    });
  };
}

export default MessageController;
