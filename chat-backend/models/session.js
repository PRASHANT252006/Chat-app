const mongoose=require('mongoose')
const {User}=require('./user.js')
const session=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    token:{
        type:String
    }
})
module.exports=mongoose.model('session',session)