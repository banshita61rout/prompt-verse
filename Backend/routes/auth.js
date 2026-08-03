import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import sendResetEmail from "../utils/mailer.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: SEVEN_DAYS
};

const issueToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//signup with email + password
router.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;
    if(!email || !password){
        return res.status(400).json({error:"Email and password are required"});
    }
    try{
        const existing = await User.findOne({ email: email.toLowerCase() });
        if(existing){
            return res.status(409).json({error:"An account with this email already exists"});
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash, name: name || "" });

        const token = issueToken(user._id);
        res.cookie("pv_token", token, cookieOptions);
        res.json({ user: { id: user._id, email: user.email, name: user.name } });
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Signup failed"});
    }
});

//login with email + password
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({error:"Email and password are required"});
    }
    try{
        const user = await User.findOne({ email: email.toLowerCase() });
        if(!user || !user.passwordHash){
            return res.status(401).json({error:"Invalid email or password"});
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if(!match){
            return res.status(401).json({error:"Invalid email or password"});
        }
        const token = issueToken(user._id);
        res.cookie("pv_token", token, cookieOptions);
        res.json({ user: { id: user._id, email: user.email, name: user.name } });
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Login failed"});
    }
});

//login/signup with google - frontend sends the id token from the google button
router.post("/google", async (req, res) => {
    const { credential } = req.body;
    if(!credential){
        return res.status(400).json({error:"Missing google credential"});
    }
    try{
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        let user = await User.findOne({ email: payload.email.toLowerCase() });
        if(!user){
            user = await User.create({
                email: payload.email,
                googleId: payload.sub,
                name: payload.name || ""
            });
        } else if(!user.googleId){
            user.googleId = payload.sub;
            await user.save();
        }

        const token = issueToken(user._id);
        res.cookie("pv_token", token, cookieOptions);
        res.json({ user: { id: user._id, email: user.email, name: user.name } });
    }catch(err){
        console.log(err);
        res.status(401).json({error:"Google sign-in failed"});
    }
});

//request a reset link by email
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if(!email){
        return res.status(400).json({error:"Email is required"});
    }
    try{
        const user = await User.findOne({ email: email.toLowerCase() });
        //always respond the same way whether or not the user exists, so we don't leak who has an account
        if(!user || !user.passwordHash){
            return res.json({ success: "If that email has an account, a reset link is on its way" });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        user.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
        await sendResetEmail(user.email, resetLink);

        res.json({ success: "If that email has an account, a reset link is on its way" });
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Something went wrong"});
    }
});

//set a new password from the emailed link
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if(!password){
        return res.status(400).json({error:"New password is required"});
    }
    try{
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() }
        });
        if(!user){
            return res.status(400).json({error:"This reset link is invalid or has expired"});
        }
        user.passwordHash = await bcrypt.hash(password, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ success: "Password updated, you can log in now" });
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Something went wrong"});
    }
});

//checks cookie still holds a valid session
router.get("/me", requireAuth, async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(401).json({error:"Not logged in"});
        }
        res.json({ user: { id: user._id, email: user.email, name: user.name } });
    }catch(err){
        res.status(500).json({error:"Something went wrong"});
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("pv_token", cookieOptions);
    res.json({ success: "Logged out" });
});

export default router;