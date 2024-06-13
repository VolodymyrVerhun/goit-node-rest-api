import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth.js";
import schema from "../schemas/contactsSchemas.js";
import * as fs from "node:fs/promises";
import path from "node:path";
import gravatar from "gravatar";
import jimp from "jimp";
import mail from "../mail.js";
import crypto from "node:crypto";

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
    const verificationToken = crypto.randomUUID();

    mail.sendMail({
      to: email,
      from: "post@post.com",
      subject: "welcome to contacts book",
      html: `To confirm your email please click on this <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a>`,
      text: `To confirm your email please open the link http://localhost:3000/api/users/verify/${verificationToken}`,
    });

    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

    const user = await User.create({
      email,
      password: passwordHash,
      avatarURL,
      verificationToken,
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

    if (user.verify === false) {
      return res.status(401).send({ message: "Please verify your email" });
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
    const newFileName = `${req.user.id}_${filename}`;
    const newFilePath = path.resolve("public", "avatars", newFileName);

    const image = await jimp.read(tmpPath);
    await image.resize(250, 250).writeAsync(newFilePath);

    await fs.unlink(tmpPath);

    const avatarURL = `/avatars/${newFileName}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL },
      { new: true }
    );
    res.status(200).json({
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken: verificationToken });
    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200).json({ message: "Email confirmed successfully" });
  } catch (error) {
    next(error);
  }
}

async function resendVerifyEmail(req, res, next) {
  try {
    const { email } = req.body;
    const { error } = schema.emailSchema.validate({ email });
    if (error) {
      return res
        .status(400)
        .json({
          message: error.details.map((detail) => detail.message).join(", "),
        });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }
    const verificationToken = user.verificationToken;
    try {
      mail.sendMail({
        to: email,
        from: "post@post.com",
        subject: "Resend: Welcome to Contacts Book",
        html: `To confirm your email, please click on this <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a>.`,
        text: `To confirm your email, please open the link: http://localhost:3000/api/users/verify/${verificationToken}`,
      });

      res.status(200).json({ message: "Verification email sent" });
    } catch (mailError) {
      console.error("Error sending email:", mailError);
      return res.status(500).json({
        message: "Failed to send verification email",
        error: mailError.message,
      });
    }
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
  verifyEmail,
  resendVerifyEmail,
};
