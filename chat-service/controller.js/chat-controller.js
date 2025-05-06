const mongoose = require('mongoose');
const MessageModel = require('../models/Message');
const ConversationModel = require('../models/Conversation');

const SendMessage = async (req, res) => {
    const fromid =req.id
    const {toid,content} = req.body
    console.log(toid)
    console.log(fromid)
    const convid = await ConversationModel.findOne({participants:{$all:[fromid,toid]}})
    console.log(convid)
    if(!convid){
        const newconv = ConversationModel({
            participants:[fromid,toid],
            lastMessage:content
        })

        console.log("new conv created____________")
        await newconv.save()
        const newmsg = MessageModel({
            content,
            sender:fromid,
            ConversationId:newconv._id
        })
        await newmsg.save()
        return res.status(200).json({msg:"Message Sent",convid:newconv._id})
    }
    const newmsg = MessageModel({
        content,
        sender:fromid,
        ConversationId:convid._id
    })
    await newmsg.save()
    convid.lastMessage = content
    await convid.save()
    return res.status(200).json({msg:"Message Sent",convid:convid._id})

}

const GetMessages = async (req, res) => {
    const {limit,skip} = req.query
    const convid = req.params.convid
    const messages = await MessageModel.find({ConversationId:convid}).limit(limit).skip(skip)
    return res.status(200).json(messages)
}

module.exports = {
    SendMessage,
    GetMessages
}