import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Database connection error:", err);
    });
    await mongoose.connect(process.env.MONGODB_URL);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
