import jwt from "jsonwebtoken";
import User from "../models/auth.js";

function auth(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (typeof authorizationHeader !== "string") {
    return res
      .status(401)
      .send({ message: "Authorization header is missing or invalid" });
  }
  const [bearer, token] = authorizationHeader.split(" ", 2);
  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Invalid token format" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Invalid token" });
    }

    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).send({ message: "Invalid token" });
      }
      if (user.token !== token) {
        return res.status(401).send({ message: "Token mismatch" });
      }

      req.user = { id: decoded.id };

      next();
    } catch (error) {
      return res.status(500).send({ message: "Internal server error" });
    }
  });
}

export default auth;
