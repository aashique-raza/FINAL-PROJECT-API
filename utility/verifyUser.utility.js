import jwt from "jsonwebtoken";
// import errorHandler from "../error/errorHandler";

const verifyUser = async (req, res, next) => {
  let token;
  try {
    // Extract token from cookie or request headers
    // Extract token from cookie or request headers
    // console.log(req.cookies.token)
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Remove "Bearer" scheme and extract token
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, msg: "No token provided" });
    }
    // Verify token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(decoded);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, msg: "Failed to authenticate token" });
    }

    // Store user information in request object for further use
    req.user = decoded;
    // Call next middleware or route handler
    next();
  } catch (error) {
    console.log(`failed to verify user`);
    console.log(error)
    res.status(500).json({ success: false, msg: "internal server error" });
  }
};

export default verifyUser;