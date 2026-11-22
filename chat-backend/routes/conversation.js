const { createOrGetConversation, getMyConversations} =
    require('../controllers/conversation.js');
const authMiddleware=require("../middleware/auth.js")
const express = require('express');
const router = express.Router();

router.post('/createOrGetConversation/:receiverId', authMiddleware, createOrGetConversation);
router.get('/getMyConversations', authMiddleware, getMyConversations);

module.exports = router;