import jwt from "jsonwebtoken";
// import errorHandler from "../error/errorHandler";

const verifyUser = async (req, res, next) => {
  try {
    // Check token in cookies or headers
    console.log(req.headers)
    console.log('in cookie',req.cookies.access_token)
    console.log('in headers',req.headers.authorization)
    console.log('token in head',req.headers.authorization.split(" "[1]))
    const token =
      req.cookies.access_token ||
      (req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : null);

        console.log(token)
    if (!token) {
     
      res
        .status(401)
        .json({ success: false, msg: "unauthorized request" });
        return 
    }

    // Verify token
    console.log('jwt secret key',process.env.JWT_SECRET_KEY)
    const decoded =await jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('decoded token',decoded)

    if (!decoded) {
      return res
        .status(401)
        .json({
          success: false,
          msg: "provided wrong token please login again",
        });
    }

    // Store user information in request object for further use
    req.user = decoded;
    // Call next middleware or route handler
    next();
  } catch (error) {
    console.log(`failed to verify user`,error);
    // console.log(error.message);
    return res
      .status(401)
      .json({ success: false, msg: "Unauthorized. Please log in again." });
  }
};

export default verifyUser;
