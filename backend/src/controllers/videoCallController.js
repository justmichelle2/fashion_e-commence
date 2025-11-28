const { VideoCall, User } = require('../models');
const axios = require('axios');

// Daily.co API configuration
const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

// Create Daily.co room and initiate call
exports.initiateCall = async (req, res) => {
    try {
        const { receiverId, callType = 'general' } = req.body;
        const initiatorId = req.user.id;

        if (initiatorId === receiverId) {
            return res.status(400).json({ error: 'Cannot call yourself' });
        }

        // Check if receiver exists
        const receiver = await User.findByPk(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create Daily.co room
        const roomName = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        let dailyRoom;
        try {
            const response = await axios.post(
                `${DAILY_API_URL}/rooms`,
                {
                    name: roomName,
                    privacy: 'private',
                    properties: {
                        max_participants: 2,
                        enable_chat: true,
                        enable_screenshare: true,
                        enable_recording: 'cloud',
                        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${DAILY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            dailyRoom = response.data;
        } catch (error) {
            console.error('Daily.co room creation error:', error.response?.data || error.message);
            return res.status(500).json({ error: 'Failed to create video room' });
        }

        // Create meeting token for initiator
        let initiatorToken;
        try {
            const tokenResponse = await axios.post(
                `${DAILY_API_URL}/meeting-tokens`,
                {
                    properties: {
                        room_name: roomName,
                        user_name: req.user.name,
                        is_owner: true
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${DAILY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            initiatorToken = tokenResponse.data.token;
        } catch (error) {
            console.error('Token creation error:', error.response?.data || error.message);
            return res.status(500).json({ error: 'Failed to create meeting token' });
        }

        // Save call to database
        const videoCall = await VideoCall.create({
            initiatorId,
            receiverId,
            roomId: dailyRoom.url,
            status: 'pending',
            callType
        });

        // Send notification to receiver via Socket.io
        const socketHandler = req.app.get('socketHandler');
        if (socketHandler) {
            socketHandler.sendToUser(receiverId, 'incoming_call', {
                callId: videoCall.id,
                from: {
                    id: req.user.id,
                    name: req.user.name,
                    avatarUrl: req.user.avatarUrl
                },
                callType
            });
        }

        res.status(201).json({
            call: {
                id: videoCall.id,
                roomId: dailyRoom.url,
                roomName: dailyRoom.name,
                token: initiatorToken,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Initiate call error:', error);
        res.status(500).json({ error: 'Failed to initiate call' });
    }
};

// Join an existing call
exports.joinCall = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const videoCall = await VideoCall.findByPk(id);

        if (!videoCall) {
            return res.status(404).json({ error: 'Call not found' });
        }

        // Verify user is part of the call
        if (videoCall.initiatorId !== userId && videoCall.receiverId !== userId) {
            return res.status(403).json({ error: 'Not authorized to join this call' });
        }

        // Extract room name from URL
        const roomName = videoCall.roomId.split('/').pop();

        // Create meeting token for joiner
        let token;
        try {
            const tokenResponse = await axios.post(
                `${DAILY_API_URL}/meeting-tokens`,
                {
                    properties: {
                        room_name: roomName,
                        user_name: req.user.name,
                        is_owner: false
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${DAILY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            token = tokenResponse.data.token;
        } catch (error) {
            console.error('Token creation error:', error.response?.data || error.message);
            return res.status(500).json({ error: 'Failed to create meeting token' });
        }

        // Update call status to active if not already
        if (videoCall.status === 'pending') {
            await videoCall.update({
                status: 'active',
                startedAt: new Date()
            });
        }

        res.json({
            token,
            roomId: videoCall.roomId,
            roomName
        });
    } catch (error) {
        console.error('Join call error:', error);
        res.status(500).json({ error: 'Failed to join call' });
    }
};

// End a call
exports.endCall = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const videoCall = await VideoCall.findByPk(id);

        if (!videoCall) {
            return res.status(404).json({ error: 'Call not found' });
        }

        // Verify user is part of the call
        if (videoCall.initiatorId !== userId && videoCall.receiverId !== userId) {
            return res.status(403).json({ error: 'Not authorized to end this call' });
        }

        const endedAt = new Date();
        const durationSeconds = videoCall.startedAt
            ? Math.floor((endedAt - videoCall.startedAt) / 1000)
            : 0;

        await videoCall.update({
            status: 'ended',
            endedAt,
            durationSeconds
        });

        // Notify other participant
        const otherUserId = videoCall.initiatorId === userId ? videoCall.receiverId : videoCall.initiatorId;
        const socketHandler = req.app.get('socketHandler');
        if (socketHandler) {
            socketHandler.sendToUser(otherUserId, 'call_ended', {
                callId: videoCall.id,
                endedBy: userId
            });
        }

        res.json({
            message: 'Call ended',
            durationSeconds
        });
    } catch (error) {
        console.error('End call error:', error);
        res.status(500).json({ error: 'Failed to end call' });
    }
};

// Get call history
exports.getCallHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        const calls = await VideoCall.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { initiatorId: userId },
                    { receiverId: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'initiator',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'name', 'avatarUrl']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const callsWithOtherUser = calls.map(call => {
            const otherUser = call.initiatorId === userId ? call.receiver : call.initiator;
            return {
                ...call.toJSON(),
                otherUser
            };
        });

        res.json({ calls: callsWithOtherUser });
    } catch (error) {
        console.error('Get call history error:', error);
        res.status(500).json({ error: 'Failed to fetch call history' });
    }
};

// Reject/cancel call
exports.rejectCall = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const videoCall = await VideoCall.findByPk(id);

        if (!videoCall) {
            return res.status(404).json({ error: 'Call not found' });
        }

        if (videoCall.receiverId !== userId) {
            return res.status(403).json({ error: 'Only receiver can reject call' });
        }

        await videoCall.update({ status: 'missed' });

        // Notify initiator
        const socketHandler = req.app.get('socketHandler');
        if (socketHandler) {
            socketHandler.sendToUser(videoCall.initiatorId, 'call_rejected', {
                callId: videoCall.id
            });
        }

        res.json({ message: 'Call rejected' });
    } catch (error) {
        console.error('Reject call error:', error);
        res.status(500).json({ error: 'Failed to reject call' });
    }
};
