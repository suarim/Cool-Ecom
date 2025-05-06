const mongoose = require('mongoose');
const Message = new mongoose.Schema({
    content:{
        type: String,
        required: true,
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
    },
    ConversationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    acknowledged:{
        type: Boolean,
        default: false,
    },

},{timestamps:true}) 
const MessageModel = mongoose.model('Message', Message);
module.exports = MessageModel;