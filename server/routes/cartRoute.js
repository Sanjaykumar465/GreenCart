import express from 'express';  // Import express to use its Router
import authUser from "../middlewares/authUser.js";
import { updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router();  // Use express.Router() instead of mongoose.Router()

cartRouter.post("/update", authUser, updateCart);

export default cartRouter;