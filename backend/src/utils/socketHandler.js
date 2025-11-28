const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = (io) => {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;

            // Update user online status
            await User.update(
                { isOnline: true, lastSeenAt: new Date() },
                { where: { id: decoded.id } }
            );

            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // Handle typing indicator
        socket.on('typing', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('user_typing', {
                userId: socket.userId,
                conversationId
            });
        });

        socket.on('stop_typing', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
                userId: socket.userId,
                conversationId
            });
        });

        // Join conversation room
        socket.on('join_conversation', ({ conversationId }) => {
            socket.join(`conversation:${conversationId}`);
        });

        // Leave conversation room
        socket.on('leave_conversation', ({ conversationId }) => {
            socket.leave(`conversation:${conversationId}`);
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.userId}`);

            // Update user offline status
            try {
                await User.update(
                    { isOnline: false, lastSeenAt: new Date() },
                    { where: { id: socket.userId } }
                );
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        });
    });

    // Helper function to send message to user
    const sendToUser = (userId, event, data) => {
        io.to(`user:${userId}`).emit(event, data);
    };

    // Helper function to send to conversation
    const sendToConversation = (conversationId, event, data) => {
        io.to(`conversation:${conversationId}`).emit(event, data);
    };

    // Broadcast to all users
    const broadcast = (event, data) => {
        io.emit(event, data);
    };

    return { sendToUser, sendToConversation, broadcast };
};
