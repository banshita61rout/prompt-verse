import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"
import authRoutes from "./routes/auth.js"

const app= express();
const PORT= process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use("/api/auth",authRoutes);
app.use("/api",chatRoutes);

const connectDB=async()=>{
  try{
await mongoose.connect(process.env.MONGODB_URI)
console.log("connected with prompt-verse DataBase!")
  }catch(err){
    console.log("failed to connect with Db",err)
}
}

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`server running on ${PORT}`);
    });
});
