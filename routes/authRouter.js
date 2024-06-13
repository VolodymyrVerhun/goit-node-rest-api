import express from "express";

import authControllers from "../controllers/authControllers.js";

const usersRouter = express.Router();
const jsonParser = express.json();

import authMiddleware from "../middlewares/auth.js";
import uploadMiddleware from "../middlewares/upload.js";

usersRouter.post("/register", jsonParser, authControllers.register);
usersRouter.post("/login", jsonParser, authControllers.login);
usersRouter.post("/logout", authMiddleware, jsonParser, authControllers.logout);
usersRouter.get(
  "/current",
  authMiddleware,
  jsonParser,
  authControllers.current
);
usersRouter.patch(
  "/",
  authMiddleware,
  jsonParser,
  authControllers.updateSubscription
);
usersRouter.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  authControllers.changeAvatar
);
usersRouter.get("/verify/:verificationToken", authControllers.verifyEmail);
usersRouter.post("/verify", authControllers.resendVerifyEmail);

export default usersRouter;
