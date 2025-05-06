const mongoose = require('mongoose');
const Conversation = new mongoose.Schema({
    participants:
        [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    lastMessage:{type:String}
},{timestamps:true})
Conversation.index({participants:1},{unique:true})
const ConversationModel = mongoose.model('Conversation', Conversation);
module.exports = ConversationModel;