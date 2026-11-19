
const Conversation = require('../models/conversation');
const { customApiError } = require('../error/customApiError.js');

const createOrGetConversation = async (req, res) => {
    const id = req.user._id;
    const receiverId = req.params.receiverId;

    if (!receiverId) {
        throw new customApiError(400, 'Please provide receiverId');
    }

    const conversations = await Conversation.findOne({
        participants: {
            $all: [id, receiverId]
        },
        $expr: {
            $eq: [{ $size: "$participants" }, 2]
        }
    });

    if (conversations) {
        return res.status(200).json(conversations);
    }

    const createconversation = await Conversation.create({
        participants: [id, receiverId]
    });

    return res.status(201).json(createconversation);
};

const getMyConversations = async (req, res) => {
    const id = req.user._id;

    const myconversation = await Conversation.find({
        participants: id
    })
    .populate("participants", "username email avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

    return res.status(200).json(myconversation);
};

module.exports = { createOrGetConversation, getMyConversations };
