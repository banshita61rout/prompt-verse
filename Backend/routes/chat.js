import express from "express";
import Thread from "../models/Thread.js";
const router =express.Router();

router.post("/test",async(req,res)=>{
    try{
const thread= new Thread({
    threadId:"abcd",
    title:"Testing New Thread2"

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
        const deletedthread=await Thread.findOneDelete({threadId});
        if(!deletedthread){
            res.status(404).json({error:"Thread Not Found"});
        }
        res.status(200).json({success:"thread.messages"});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"failed to delete thread"});
    }
});





export default router;