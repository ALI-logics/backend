import prisma from "../lib/prismaClient.js";
import { validateToken } from "../utils/jsonwebtoken.js";

import { upload } from "./multer.js";

const authMiddleware = async (req, res, next) => {
  try {
    console.log("you are in middleware");
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.send("you are not logged in");
    }
    console.log("token", token);
    const { id: userId } = validateToken(token);
    console.log("is verified", userId);
    const isExist = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!isExist) {
      return res.send("you are not logged in");
    }
    const { password, ...user } = isExist;
    console.log("user", user);
    req.user = user;
    next();
  } catch (err) {
    console.log("error", err);
    return res.send("you are not logged in");
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.send("you are not authorized");
  }
  next();
};


export {adminMiddleware, authMiddleware, upload}