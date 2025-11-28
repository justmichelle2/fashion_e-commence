const { Notification, User } = require('../models');
const { Op } = require('sequelize');

// Create notification (helper function)
async function createNotification(userId, type, title, message, data = {}, actionUrl = null) {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            data,
            actionUrl
        });

        // Send real-time notification via Socket.io
        const io = global.io; // Assuming io is set globally
        if (io) {
            io.to(`user:${userId}`).emit('new_notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
}

// Get notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { unreadOnly, limit = 20, offset = 0 } = req.query;

        let whereClause = { userId };

        if (unreadOnly === 'true') {
            whereClause.readAt = null;
        }

        const notifications = await Notification.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const unreadCount = await Notification.count({
            where: { userId, readAt: null }
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notification.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!notification.readAt) {
            await notification.update({ readAt: new Date() });
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.update(
            { readAt: new Date() },
            {
                where: {
                    userId,
                    readAt: null
                }
            }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notification.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await notification.destroy();

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, sms, push, types } = req.body;

        const user = await User.findByPk(userId);
        const prefs = user.notificationPrefs || {};

        if (email !== undefined) prefs.email = email;
        if (sms !== undefined) prefs.sms = sms;
        if (push !== undefined) prefs.push = push;
        if (types) prefs.types = types; // { order: true, message: true, follow: false, etc. }

        await user.update({ notificationPrefs: prefs });

        res.json({ message: 'Notification preferences updated', preferences: prefs });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        const prefs = user.notificationPrefs || {
            email: true,
            sms: false,
            push: true,
            types: {
                order: true,
                message: true,
                follow: true,
                like: true,
                comment: true,
                live: true,
                custom_order: true,
                withdrawal: true
            }
        };

        res.json({ preferences: prefs });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
};

// Export helper function for use in other controllers
module.exports.createNotification = createNotification;
module.exports.getNotifications = exports.getNotifications;
module.exports.markAsRead = exports.markAsRead;
module.exports.markAllAsRead = exports.markAllAsRead;
module.exports.deleteNotification = exports.deleteNotification;
module.exports.updatePreferences = exports.updatePreferences;
module.exports.getPreferences = exports.getPreferences;
