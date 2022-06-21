import apn from "apn";
import { DeviceTokenModel } from "../models/index.js";
import { Notification, ApnsClient } from 'apns2'
import fs from 'fs';

import admin from "firebase-admin";
const serviceAccount = JSON.parse(fs.readFileSync("/var/www/webpushes/cashalot-fl-firebase-admin.json"));

admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

class PushController {

    fcm = function (req, res, next) {

        const notification_options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };

	const  registrationToken = "fs4M7aryQVOw_nAWkgh6kz:APA91bFjnXIdsAu-ymj06uQKvrUHutLS7NxXrbSnnPHdhpm6aKxcqBeDl-UOUS4yC4XNenUx-hryLfha-JKPYpRDyGikdq3LEf_P_6YJO_AVCeDpdEzPkcnKJk2gZqz-hSkcJpSOpslb";
        //const message = "Hello world!";
	const message = {
            notification: {
                title: "This is a Notification",
                body: "This is the body of the notification message."
            },
        };
        const options =  notification_options;

        admin.messaging().sendToDevice(registrationToken, message, options)
            .then( response => {

                res.status(200).send("Notification sent successfully");

            })
            .catch( error => {
                console.log(error);
		res.json({error: error});
             });

    };

    index = async function(req, res, next) {

	const userId = req.body.userId;

	DeviceTokenModel.find({user: userId})
	    .then( (doc) => {
		console.log(doc);
		if ( doc.platform === "android"){
		    
		} else if ( doc.platform === "ios") {
		   
		} else {
		    //next();
		}
	    })
        let token = "7f4588d5ceb988020f777ebcba87e5fdcd0c36001bb68e33b5c8bf962d0729f7";

        const client = new ApnsClient({
	    host: 'api.sandbox.push.apple.com',
	    port: 443,
            team: `8T287D8PYU`,
            keyId: `9HU4TZ5FNM`,
            signingKey: fs.readFileSync(`/var/www/webpushes/AuthKey_9HU4TZ5FNM.p8`),
            defaultTopic: `com.application.chat`
        });

        const bn = new Notification(token, { alert: 'Hello, World' })

        try {
           await client.send(bn);
	   return res.json({success: "true"});
        } catch (err) {
            console.error(err.reason);
	    return res.json({error: err});
        }
    }

    setDeviceToken = function(req, res, next) {

        console.log("Saving users device token");

        const userId = req.body.userId;
	const token = req.body.deviceToken;
        const platform = req.body.platform;


	console.log(userId, token, platform);

        if (token && platform && userId) {

	    DeviceTokenModel.find({ token: token })
                .then((deviceToken) => {
		    if (deviceToken != null) {
		        res.json({ 
                            message: "Device token already exist",
                            deviceToken: deviceToken
                        });
  	 	        return
		    }
            	    let deviceTokenObj = {
                	user: userId,
                	token: token,
                	platform: platform
        	    };
                    const newDeviceToken = new DeviceTokenModel(deviceTokenObj);

                    deviceToken
        	        .save()
                	.then((obj) => {
                    	    res.status(201).json(obj);
                    	    console.log(obj);
	                    return
                    })
                    .catch(err => {
                        res.status(400).json({
                            status: "error",
                            message: err
                        });
                        console.log(err);
                        return
                    });
		})
                .catch((err) => {
                    return res.status(404).json({
                        status: "error",
                        message: err,
                    });
		    console.log(err);
		    //next();
		    return
                });

        };

    };


};

export default PushController;


