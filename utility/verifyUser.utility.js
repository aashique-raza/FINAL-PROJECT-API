import jwt from "jsonwebtoken";
// import errorHandler from "../error/errorHandler";

const verifyUser = async (req, res, next) => {
  let token;
  // console.log(token)
  try {
    // Extract token from cookie or request headers
    // console.log('yeh hai first token', req.cookies.access_token); // Corrected code
    // console.log('headers checking',req.headers.cookie)

    if (req.cookies.access_token) { 
      token=req.cookies.access_token
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, msg: "No token provided" });
    }

    // Verify token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    
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
    console.log(error.message)
    res.status(500).json({ success: false, msg: "internal server error" });
  }
};


export default verifyUser;