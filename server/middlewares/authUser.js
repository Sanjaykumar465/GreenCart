import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized" });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDecode) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "Not Authorized" });
    }
    next();
  } catch (error) {
    res.json({ success: fslse, message: error.message });
  }
};

export default authUser;
