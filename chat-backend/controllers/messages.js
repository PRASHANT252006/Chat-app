const { customApiError } = require('../error/customApiError.js');
const Message = require('../models/message.js');
const Conversation = require('../models/conversation.js');
const {checkConversationAccess}=require('../utils/checkConversationAccess.js')


const getMessages = async (req, res) => {
    const { conversationId } = req.params;

    await checkConversationAccess(conversationId, req.user._id);

    const messages = await Message.find({ conversation: conversationId })
        .populate('sender', 'username avatar')
        .sort({ createdAt: 1 });

    return res.status(200).json(messages);
};

const sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

    if (!text) {
        throw new customApiError(400, 'Message cannot be empty');
    }
    if (text.length > 2000) {
        throw new customApiError(400, 'Message is too long');
    }

    const found = await checkConversationAccess(conversationId, req.user._id);

    const created = await Message.create({
        conversation: found._id,
        sender: req.user._id,
        text,
        readBy:[req.user._id]
    });

    found.lastMessage = created._id;
    await found.save();

    await created.populate('sender', 'username avatar');

 // Get Socket.IO instance
    const io = req.app.get('io');

    // Find participants except sender
    const otherParticipants = found.participants.filter(
        (p) => String(p) !== String(req.user._id)
    );

    // Emit message to each receiver's personal room
//This sends the saved and populated message to the receiver's personal room.
    otherParticipants.forEach((participantId) => {
        io.to(`user:${participantId}`).emit('message:new', created);
    });


    return res.status(201).json(created);
};

const markMessagesRead = async (req, res) => {
     const conversationId=req.params.conversationId;
     const conversation = await checkConversationAccess(
    conversationId,
    req.user._id
);
await Message.updateMany(
    {
        conversation: conversation._id,
        readBy: { $ne: req.user._id }
    },
    {
        //Unlike $push, $addToSet adds an element only if it doesn't already exist in the array.
        $addToSet: {
            readBy: req.user._id
        }
    }
);
return res.status(200).json({
    conversationId,
    unreadCount: 0
});
};

module.exports = { getMessages, sendMessage, markMessagesRead };