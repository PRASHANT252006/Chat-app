
const Conversation = require('../models/conversation');
const { customApiError } = require('../error/customApiError.js');
const user = require('../models/user.js');

const createOrGetConversation = async (req, res) => {
    const id = req.user._id;
    const receiverId = req.params.receiverId;

    if (!receiverId) {
        throw new customApiError(400, 'Please provide receiverId');
    }
if(String(receiverId)===String(id)){
    throw new customApiError(400,"please provide receiverId")
}
 const receiver = await user.findById(receiverId).select('_id');

    if (!receiver) {
        throw new customApiError(404, 'User not found');
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
    .populate("participants", "username  avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

    return res.status(200).json(myconversation);
};

module.exports = { createOrGetConversation, getMyConversations };
