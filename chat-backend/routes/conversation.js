const { createOrGetConversation, getMyConversations } =
    require('../controllers/conversation.js');

const express = require('express');
const router = express.Router();

router.post('/createOrGetConversation/:receiverId', createOrGetConversation);
router.get('/getMyConversations', getMyConversations);

module.exports = router;