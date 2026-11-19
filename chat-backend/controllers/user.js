const conversationModel = require('../models/conversation');
const user=require('../models/user.js')
const mongoose=require('mongoose')
const {customApiError} = require('../error/customApiError.js');
const getUsers=async(req,res)=>{
        
   const id = req.user._id;
    const getallusers=await user.find({_id:{$ne:id}}).select(["email","username","avatar","_id"])
    res.status(200).json(getallusers)
}

const getMe=async(req,res)=>{

   const id = req.user._id;
   const me=await user.findById(id).select(["email","username","avatar","_id"])
   res.status(200).json(me)
}
module.exports={getUsers,getMe};
