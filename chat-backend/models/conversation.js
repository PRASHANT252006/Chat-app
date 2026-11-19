const mongoose=require('mongoose')

const conversation=new mongoose.Schema({
   participants:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user'
   }],
   lastMessage:{
    type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
   }

},{timestamps:true})





module.exports=mongoose.model('conversation',conversation)






// To access the participants in a Mongoose query:
// const conversations = await Conversation.find({
//     participants: req.user._id
// });


// Explanation: This finds all conversations where the participants array contains the logged-in user's ID.

// To get participant details instead of just ObjectIds:
// const conversations = await Conversation.find({
//     participants: req.user._id
// }).populate("participants", "username email avatar");


// populate() replaces the referenced User ObjectIds with actual user details.










// {
//     _id: ObjectId("671a11111111111111111111"),

//     participants: [
//         ObjectId("671a22222222222222222222"),
//         ObjectId("671a33333333333333333333")
//     ],

//     lastMessage: ObjectId("671a44444444444444444444"),

//     createdAt: ISODate("2026-11-19T10:00:00Z"),
//     updatedAt: ISODate("2026-11-19T10:30:00Z")
// }