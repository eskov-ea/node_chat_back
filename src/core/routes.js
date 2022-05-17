import bodyParser from "body-parser";
import express from "express";
import {Socket} from "socket.io";
import { dirname } from 'path';
// import { updateLastSeen, checkAuth } from "../middlewares";
import { loginValidation, registerValidation } from "../utils/validations/index.js";
// import UserCtrl from "../controllers/UserController.js";
import { DialogCtrl, UserCtrl, MessageCtrl } from "../controllers/index.js";
// import multer from "./multer";



const createRoutes = (app, io) => {
  const UserController = new UserCtrl(io);
  const DialogController = new DialogCtrl(io);
  const MessageController = new MessageCtrl(io);
  // const UploadFileController = new UploadFileCtrl();

  app.use(bodyParser.json());
  // app.use(checkAuth);
  // app.use(updateLastSeen);
  
  const prefix = "/api";
  app.get(prefix + "/", (req, res) => {
    res.send("Hello, World! ///////");
  });


  app.get("/api", (req, res) => {
    res.send("Hello, World!");
  });
  app.get(prefix + "/client", (req, res) => {
    res.sendFile('/var/www/webpushes/node_chat_back/' + 'index.html');
  });

  app.get(prefix + "/user/me", UserController.getMe);
  // app.get("/user/verify", UserController.verify);
  app.post(prefix + "/user/signup", registerValidation, UserController.create);
  app.post(prefix + "/user/signin", loginValidation, UserController.login);
  app.get(prefix + "/user/find", UserController.findUsers);
  app.get(prefix + "/user/:id", UserController.show);
  // app.delete("/user/:id", UserController.delete);
  //
  app.get(prefix + "/dialogs/:id", DialogController.index);
  app.post(prefix + "/dialog/find", DialogController.findDialog);
  app.delete(prefix + "/dialogs/:id", DialogController.delete);
  app.post(prefix + "/dialogs", DialogController.create);
  //
  app.get(prefix + "/messages", MessageController.index);
  app.post(prefix + "/messages", MessageController.create);
  app.delete(prefix + "/messages", MessageController.delete);
  //
  // app.post("/files", multer.single("file"), UploadFileController.create);
  // app.delete("/files", UploadFileController.delete);
};

export default createRoutes;
