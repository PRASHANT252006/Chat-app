const express=require('express')
const auth=require('../middleware/auth.js')
const router=express.Router()
const rateLimit = require('../middleware/rateLimit');

const {getMessages, sendMessage, markMessagesRead }=require('../controllers/messages.js')

const sendMessageLimiter = rateLimit(
    'sendMessage',
    20,
    10,
    (req) => String(req.user._id)
);
router.get('/getMessage/:conversationId',auth,getMessages)
router.post('/sendMessage/:conversationId',auth,sendMessageLimiter,sendMessage)
router.patch('/markMessagesRead/:conversationId',auth,markMessagesRead)
module.exports=router;