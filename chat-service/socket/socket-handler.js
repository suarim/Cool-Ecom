const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

module.exports = (io) => {
    io.on('connection', (socket) => {   
        socket.on('join', (msg) => {
            console.log('Received message:', typeof(msg)); // Check the structure of the incoming object
            if (msg && msg.conversationId) {
              console.log('User joined conversation:', msg.conversationId);
              socket.join(msg.conversationId);
            } else {
              console.log('conversationId is undefined or missing');
            }
          });
          
        socket.on('sendMessage',async ({fromId, toId, content, conversationId})=>{
            try{
                console.log({fromId, toId, content, conversationId})
                const newMessage = new Message({
                    content,
                    sender:fromId,
                    ConversationId:conversationId
                })
                await newMessage.save()
                const conversation = await Conversation.findById(conversationId)
                conversation.lastMessage = content
                await conversation.save()
                io.emit('messageReceived',{
                    fromId,
                    toId,
                    content,
                    conversationId
                })
                console.log('Message sent:', content)
            }
            catch(err){
                console.log(err)
            }
        })
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    }
)}