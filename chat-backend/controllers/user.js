const conversationModel = require('../models/conversation');
const user=require('../models/user.js')
const mongoose=require('mongoose')
const {customApiError} = require('../error/customApiError.js');
const bcrypt=require('bcryptjs')
const session=require('../models/session.js')
const getUsers = async (req, res) => {
  const id = req.user._id;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const filter = { _id: { $ne: id } };

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.username = { $regex: escaped, $options: 'i' };
  }

  const users = await user.find(filter).select('_id username avatar');
  res.status(200).json(users);
};

const getMe=async(req,res)=>{

   const id = req.user._id;
   const me=await user.findById(id).select(["email","username","avatar","_id"])
   res.status(200).json(me)
}


module.exports={getUsers,getMe};
