const Conversation = require('../models/conversation.js');
const { customApiError } = require('../error/customApiError.js');

const checkConversationAccess = async (conversationId, userId) => {
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

module.exports = { checkConversationAccess };