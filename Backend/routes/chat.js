import express from "express";
import Thread from "../models/Thread.js";
const router = express.Router();
import getOpenAPIResponse from "../utils/Openai.js";

router.post("/test",async(req,res)=>{
    try{
const thread= new Thread({
    threadId:"abcd123",
    title:"Testing New Thread3"

});
const response = await thread.save();
    }catch(err){
console.log(err);
res.status(500).json({error:"failed to save in DB"});
    }
});
//Get all threads
router.get("/thread",async(req,res)=>{
    try{
        const threads=await Thread.find({}).sort({updatedAt:-1});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to fetch threads"});
    }
});

//get 1 specific threadd by its id
router.get("/thread/:threadId",async(req,res)=>{
    const {threadId} =req.params;
    try{
        const thread =await Thread.findOne({threadId});
        if(!thread){
            res.status(404).json({error:"Thread Not Found"});
        }
        res.json(thread.messages);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to fetch chat"});
    }
});

//deleting thread 
router.delete("/thread/:threadId",async(req,res)=>{
    const {threadId} =req.params;
    try{
        const deletedthread=await Thread.findOneAndDelete({threadId});
        if(!deletedthread){
            res.status(404).json({error:"Thread Not Found"});
        }
        res.status(200).json({success:"thread deleted Successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to delete thread"});
    }
});

//**** post  chat  *//
//validate threadID,message
//if threadId is not in DB {CREATE NEW tHREAD} 
//  save the message (user) in thread get openAI response 

router.post("/chat",async(req,res)=>{
    const{threadId,message}=req.body;
    if(!threadId || !message){
        res.status(400).json({error:"Missing required feild"});

    }
try{
    const thread=await Thread.findOne({threadId});
    if(!thread){
  //creat new thread
        thread=new Thread({
            threadId,
            title:message,
            messages:[{role:"user",content: message}]
        })
    } else{
        thread.messages.push({role:"user",content: message});
    }
    const assistantReply=await getOpenAPIResponse(message);
thread.messages.push({role:"assistant",content: assistantReply});
thread.updatedAt=new Date();
await thread.save();
res.json({reply:assistantReply});


}catch(err){
    console.log(err);
    res.status(500).json({error:"Something went wrong"});
}

})

export default router;