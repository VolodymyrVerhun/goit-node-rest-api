import express from "express";

import authControllers from "../controllers/authControllers.js";

const usersRouter = express.Router();
const jsonParser = express.json();

import authMiddleware from "../middlewares/auth.js";

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

export default usersRouter;
