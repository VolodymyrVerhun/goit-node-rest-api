import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth.js";
import schema from "../schemas/contactsSchemas.js";
import * as fs from "node:fs/promises";
import path from "node:path";
import gravatar from "gravatar";
import jimp from "jimp";

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    const { error } = schema.registerSchema.validate({ email, password });

    if (error) {
      return res.status(400).json({
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }

    const newUser = await User.findOne({ email });
    if (newUser !== null) {
      return res.status(409).send({ message: "User already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

    const user = await User.create({
      email,
      password: passwordHash,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (user === null) {
      return res
        .status(401)
        .send({ message: "Email or password is incorrect" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch === false) {
      return res
        .status(401)
        .send({ message: "Email or password is incorrect" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await User.findByIdAndUpdate(user._id, { token }, { new: true });
    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null }, { new: true });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function current(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("email subscription");

    if (!user) {
      return res.status(401).send({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
}

async function updateSubscription(req, res, next) {
  const { id } = req.user;
  const { subscription } = req.body;

  const { error } = schema.updateSubscriptionSchema.validate({ subscription });

  if (error) {
    return res.status(400).json({
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { subscription },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
}

async function changeAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { filename, path: tmpPath } = req.file;
    const newFilePath = path.resolve("public", "avatars", filename);

    const image = await jimp.read(tmpPath);
    await image.resize(250, 250).writeAsync(newFilePath);

    await fs.unlink(tmpPath);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatarURL: req.file.filename,
      },
      { new: true }
    );
    res.status(200).json({
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  logout,
  current,
  updateSubscription,
  changeAvatar,
};
