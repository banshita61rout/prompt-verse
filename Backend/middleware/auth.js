import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
    const token = req.cookies?.pv_token;
    if(!token){
        return res.status(401).json({error:"Not logged in"});
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }catch(err){
        return res.status(401).json({error:"Session expired, please log in again"});
    }
};

export default requireAuth;
