const { customApiError } = require('../error/customApiError.js');
const Message = require('../models/message.js');
const Conversation = require('../models/conversation.js');

const getConversationForUser = async (conversationId, userId) => {
    const found = await Conversation.findById(conversationId);
    if (!found) {
        throw new customApiError(404, 'Conversation not found');
    }
    const isMember = found.participants.some((p) => String(p) === String(userId));
    if (!isMember) {
        throw new customApiError(403, 'You are not part of this conversation');
    }
    return found;
};

const getMessages = async (req, res) => {
    const { conversationId } = req.params;

    await getConversationForUser(conversationId, req.user._id);

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

    const found = await getConversationForUser(conversationId, req.user._id);

    const created = await Message.create({
        conversation: found._id,
        sender: req.user._id,
        text
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

module.exports = { getMessages, sendMessage };