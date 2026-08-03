import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash:{
        type: String,
    },
    googleId:{
        type: String
    },
    name:{
        type: String,
        default: ""
    },
    resetToken:{
        type: String
    },
    resetTokenExpiry:{
        type: Date
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("User", UserSchema);
