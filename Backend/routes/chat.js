import express from "express";
import Thread from "../models/Thread.js";
const router = express.Router();
import getGroqResponse from "../utils/Groq.js";
import requireAuth from "../middleware/auth.js";


router.use(requireAuth);

router.post("/test",async(req,res)=>{
    try{
const thread= new Thread({
    userId: req.userId,
    threadId:"abcd123",
    title:"Testing New Thread3"

});
const response = await thread.save();
res.json(response);
    }catch(err){
console.log(err);
res.status(500).json({error:"failed to save in DB"});
    }
});
//Get all threads for the logged in user
router.get("/thread",async(req,res)=>{
    try{
        const threads=await Thread.find({userId: req.userId}).sort({updatedAt:-1});
        res.json(threads);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to fetch threads"});
    }
});

//get 1 specific thread by  id
router.get("/thread/:threadId",async(req,res)=>{
    const {threadId} =req.params;
    try{
        const thread =await Thread.findOne({threadId, userId: req.userId});
        if(!thread){
            return res.status(404).json({error:"Thread Not Found"});
        }
        res.json(thread.messages);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to fetch chat"});
    }
});

//rename a thread's title
router.patch("/thread/:threadId",async(req,res)=>{
    const {threadId} =req.params;
    const {title} = req.body;
    if(!title || !title.trim()){
        return res.status(400).json({error:"title cannot be empty"});
    }
    try{
        const updated=await Thread.findOneAndUpdate({threadId, userId: req.userId},{title},{new:true});
        if(!updated){
            return res.status(404).json({error:"Thread Not Found"});
        }
        res.json(updated);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to rename thread"});
    }
});

//deleting thread
router.delete("/thread/:threadId",async(req,res)=>{
    const {threadId} =req.params;
    try{
        const deletedthread=await Thread.findOneAndDelete({threadId, userId: req.userId});
        if(!deletedthread){
            return res.status(404).json({error:"Thread Not Found"});
        }
        res.status(200).json({success:"thread deleted Successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to delete thread"});
    }
});

//**** post  chat  *//
//validate threadID,message

//  save the message (user) in thread get response

router.post("/chat",async(req,res)=>{
    const{threadId,message}=req.body;
    if(!threadId || !message){
        return res.status(400).json({error:"Missing required feild"});
    }
try{
    let thread=await Thread.findOne({threadId, userId: req.userId});
    if(!thread){
  // new thread
        thread=new Thread({
            userId: req.userId,
            threadId,
            title:message,
            messages:[{role:"user",content: message}]
        })
    } else{
        thread.messages.push({role:"user",content: message});
    }
    const assistantReply=await getGroqResponse(message);
thread.messages.push({role:"assistant",content: assistantReply});
thread.updatedAt=new Date();
await thread.save();
res.json({reply:assistantReply,threadId:thread.threadId,title:thread.title});


}catch(err){
    console.log(err);
    res.status(500).json({error:"Something went wrong"});
}

})

export default router;
