import express from "express";
import verifyJWTToken from "../utils/verifyJWTToken.js";
//import { DecodedData } from "../utils/verifyJWTToken";

export default (
  req,
  res,
  // next
) => {
  if (
    req.path === "/user/signin" ||
    req.path === "/user/signup" ||
    req.path === "/user/verify"
  ) {
    return next();
  }

  const token = "token" in req.headers ? req.headers.token : null;
  if (token) {
    try {
	const user = verifyJWTToken(token);
	res.status(200).json({ user: user });
    } catch (err) {
	console.log(err);
	res.status(403).json({ message: "Invalid auth token provided" });
    }
  } else {
    res.status(403).json({ message: "Auth token not provided" });
  }
};
