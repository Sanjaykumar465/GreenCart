import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authUser = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not Authorized, no token" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    req.user = await User.findById(decoded.id).select("-password");
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ 
      success: false, 
      message: "Not Authorized, token failed" 
    });
  }
};

export default authUser;