import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  try {
    const { sellerToken } = req.cookies;
    
    if (!sellerToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token missing" 
      });
    }

    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    
    if (decoded.email !== process.env.SELLER_EMAIL) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized as seller" 
      });
    }

    req.user = {
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired, please login again" 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Invalid authentication token" 
    });
  }
};

export default authSeller;