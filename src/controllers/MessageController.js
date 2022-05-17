import express from "express";
import {Socket} from "socket.io";

import { MessageModel, DialogModel } from "../models/index.js";

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

    console.log(req.body);
    console.log(req.file);

    const postData = {
      text: req.body.text,
      dialog: req.body.dialog_id,
      attachments: req.body.attachments,
      user: userId,
    };
    const message = new MessageModel(postData);

    console.log(postData);
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

        MessageModel.findOne(
          { dialog: dialogId },
          {},
          { sort: { created_at: -1 } },
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

              dialog.lastMessage = lastMessage ? lastMessage.toString() : "";
              dialog.save();
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
