const { LiveStream, User, Follow } = require('../models');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// Agora configuration
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// Generate Agora token
function generateAgoraToken(channelName, uid, role = RtcRole.PUBLISHER) {
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    return RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpiredTs
    );
}

// Create/start live stream
exports.createStream = async (req, res) => {
    try {
        const { title, description, scheduledAt } = req.body;
        const designerId = req.user.id;

        if (req.user.role !== 'designer') {
            return res.status(403).json({ error: 'Only designers can create live streams' });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Stream title is required' });
        }

        // Generate unique channel name
        const channelName = `stream-${designerId}-${Date.now()}`;

        // Generate Agora token for broadcaster
        const uid = parseInt(designerId.replace(/-/g, '').substring(0, 10), 16) || 0;
        const token = generateAgoraToken(channelName, uid, RtcRole.PUBLISHER);

        // Create stream record
        const stream = await LiveStream.create({
            designerId,
            title: title.trim(),
            description: description?.trim() || '',
            streamKey: channelName,
            agoraAppId: AGORA_APP_ID,
            agoraToken: token,
            status: scheduledAt ? 'scheduled' : 'live',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            startedAt: scheduledAt ? null : new Date()
        });

        // If going live now, notify followers
        if (!scheduledAt) {
            const followers = await Follow.findAll({
                where: { followingId: designerId, notificationsEnabled: true }
            });

            const socketHandler = req.app.get('socketHandler');
            if (socketHandler) {
                followers.forEach(follow => {
                    socketHandler.sendToUser(follow.followerId, 'designer_live', {
                        streamId: stream.id,
                        designer: {
                            id: req.user.id,
                            name: req.user.name,
                            avatarUrl: req.user.avatarUrl
                        },
                        title: stream.title
                    });
                });
            }
        }

        res.status(201).json({
            stream: {
                id: stream.id,
                channelName,
                appId: AGORA_APP_ID,
                token,
                status: stream.status,
                title: stream.title,
                description: stream.description
            }
        });
    } catch (error) {
        console.error('Create stream error:', error);
        res.status(500).json({ error: 'Failed to create stream' });
    }
};

// End stream
exports.endStream = async (req, res) => {
    try {
        const { id } = req.params;
        const designerId = req.user.id;

        const stream = await LiveStream.findByPk(id);

        if (!stream) {
            return res.status(404).json({ error: 'Stream not found' });
        }

        if (stream.designerId !== designerId) {
            return res.status(403).json({ error: 'Not authorized to end this stream' });
        }

        if (stream.status !== 'live') {
            return res.status(400).json({ error: 'Stream is not live' });
        }

        await stream.update({
            status: 'ended',
            endedAt: new Date()
        });

        // Notify viewers
        const socketHandler = req.app.get('socketHandler');
        if (socketHandler) {
            socketHandler.broadcast('stream_ended', {
                streamId: stream.id
            });
        }

        const durationSeconds = Math.floor((stream.endedAt - stream.startedAt) / 1000);

        res.json({
            message: 'Stream ended',
            peakViewerCount: stream.peakViewerCount,
            durationSeconds
        });
    } catch (error) {
        console.error('End stream error:', error);
        res.status(500).json({ error: 'Failed to end stream' });
    }
};

// Get active streams
exports.getActiveStreams = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const streams = await LiveStream.findAll({
            where: { status: 'live' },
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl'],
                include: [{
                    model: require('../models').DesignerProfile,
                    as: 'designerProfile',
                    attributes: ['isVerified']
                }]
            }],
            order: [['startedAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const streamsWithDesigner = streams.map(stream => ({
            ...stream.toJSON(),
            designer: {
                ...stream.designer.toJSON(),
                isVerified: stream.designer.designerProfile?.isVerified || false
            }
        }));

        res.json({ streams: streamsWithDesigner });
    } catch (error) {
        console.error('Get active streams error:', error);
        res.status(500).json({ error: 'Failed to fetch active streams' });
    }
};

// Join stream as viewer
exports.joinStream = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const stream = await LiveStream.findByPk(id, {
            include: [{
                model: User,
                as: 'designer',
                attributes: ['id', 'name', 'avatarUrl']
            }]
        });

        if (!stream) {
            return res.status(404).json({ error: 'Stream not found' });
        }

        if (stream.status !== 'live') {
            return res.status(400).json({ error: 'Stream is not live' });
        }

        // Generate viewer token
        const viewerUid = userId
            ? parseInt(userId.replace(/-/g, '').substring(0, 10), 16) || Math.floor(Math.random() * 100000)
            : Math.floor(Math.random() * 100000);

        const token = generateAgoraToken(stream.streamKey, viewerUid, RtcRole.SUBSCRIBER);

        // Increment viewer count
        await stream.increment('viewerCount');

        // Update peak viewer count if necessary
        if (stream.viewerCount + 1 > stream.peakViewerCount) {
            await stream.update({ peakViewerCount: stream.viewerCount + 1 });
        }

        res.json({
            channelName: stream.streamKey,
            appId: AGORA_APP_ID,
            token,
            uid: viewerUid,
            stream: {
                id: stream.id,
                title: stream.title,
                description: stream.description,
                viewerCount: stream.viewerCount + 1,
                designer: stream.designer
            }
        });
    } catch (error) {
        console.error('Join stream error:', error);
        res.status(500).json({ error: 'Failed to join stream' });
    }
};

// Leave stream (decrement viewer count)
exports.leaveStream = async (req, res) => {
    try {
        const { id } = req.params;

        const stream = await LiveStream.findByPk(id);

        if (!stream) {
            return res.status(404).json({ error: 'Stream not found' });
        }

        if (stream.viewerCount > 0) {
            await stream.decrement('viewerCount');
        }

        res.json({ message: 'Left stream' });
    } catch (error) {
        console.error('Leave stream error:', error);
        res.status(500).json({ error: 'Failed to leave stream' });
    }
};

// Get designer's stream history
exports.getStreamHistory = async (req, res) => {
    try {
        const { designerId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const streams = await LiveStream.findAll({
            where: {
                designerId,
                status: 'ended'
            },
            order: [['startedAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({ streams });
    } catch (error) {
        console.error('Get stream history error:', error);
        res.status(500).json({ error: 'Failed to fetch stream history' });
    }
};
