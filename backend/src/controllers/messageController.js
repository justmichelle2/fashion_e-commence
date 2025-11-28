const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

// Get user's conversations
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { participant1Id: userId },
                    { participant2Id: userId }
                ]
            },
            order: [['lastMessageAt', 'DESC']],
            limit: 50
        });

        // Get other participant info and unread count for each conversation
        const conversationsWithDetails = await Promise.all(conversations.map(async (conv) => {
            const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;

            const otherUser = await User.findByPk(otherUserId, {
                attributes: ['id', 'name', 'avatarUrl', 'isOnline', 'role']
            });

            const unreadCount = await Message.count({
                where: {
                    conversationId: conv.id,
                    receiverId: userId,
                    readAt: null
                }
            });

            return {
                ...conv.toJSON(),
                otherUser,
                unreadCount
            };
        }));

        res.json({ conversations: conversationsWithDetails });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

// Get messages in a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;
        const userId = req.user.id;

        // Verify user is part of conversation
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
            return res.status(403).json({ error: 'Not authorized to view this conversation' });
        }

        let whereClause = { conversationId };
        if (before) {
            whereClause.createdAt = { [Op.lt]: new Date(before) };
        }

        const messages = await Message.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        const hasMore = messages.length === parseInt(limit);

        res.json({
            messages: messages.reverse(), // Return in chronological order
            hasMore
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content, mediaUrls, messageType } = req.body;
        const senderId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ error: 'Cannot send message to yourself' });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            where: {
                [Op.or]: [
                    { participant1Id: senderId, participant2Id: receiverId },
                    { participant1Id: receiverId, participant2Id: senderId }
                ]
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participant1Id: senderId,
                participant2Id: receiverId,
                lastMessageAt: new Date(),
                lastMessagePreview: content.substring(0, 100)
            });
        } else {
            await conversation.update({
                lastMessageAt: new Date(),
                lastMessagePreview: content.substring(0, 100)
            });
        }

        const message = await Message.create({
            senderId,
            receiverId,
            conversationId: conversation.id,
            content: content.trim(),
            mediaUrls: mediaUrls || [],
            messageType: messageType || 'text'
        });

        // Emit socket event for real-time delivery
        const io = req.app.get('io');
        const socketHandler = req.app.get('socketHandler');
        if (socketHandler) {
            socketHandler.sendToUser(receiverId, 'new_message', message);
        }

        // TODO: Create notification for receiver

        res.status(201).json({ message: 'Message sent', data: message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        await Message.update(
            { readAt: new Date() },
            {
                where: {
                    conversationId,
                    receiverId: userId,
                    readAt: null
                }
            }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

// Upload media for messages
exports.uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // File URL will be set by upload middleware
        const fileUrl = req.file.location || `/uploads/${req.file.filename}`;

        res.json({ url: fileUrl });
    } catch (error) {
        console.error('Upload media error:', error);
        res.status(500).json({ error: 'Failed to upload media' });
    }
};
