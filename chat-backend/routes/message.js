const express=require('express')
const auth=require('../middleware/auth.js')
const router=express.Router()

const {getMessages, sendMessage }=require('../controllers/messages.js')

router.get('/getMessage/:conversationId',auth,getMessages)
router.post('/sendMessage/:conversationId',auth,sendMessage)

module.exports=router;