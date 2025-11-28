const { Withdrawal, User, Order } = require('../models');
const { Op } = require('sequelize');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

// Encryption for account details
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(JSON.stringify(text));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
}

// Calculate available balance
async function getAvailableBalance(designerId) {
    // Get total revenue from completed orders
    const completedOrders = await Order.findAll({
        where: {
            designerId,
            status: { [Op.in]: ['delivered', 'completed'] }
        }
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalCents, 0);

    // Get total withdrawn amount
    const withdrawals = await Withdrawal.findAll({
        where: {
            designerId,
            status: { [Op.in]: ['completed', 'processing'] }
        }
    });

    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amountCents, 0);

    return totalRevenue - totalWithdrawn;
}

// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
    try {
        const { amountCents, currency = 'USD', method, accountDetails } = req.body;
        const designerId = req.user.id;

        if (req.user.role !== 'designer') {
            return res.status(403).json({ error: 'Only designers can request withdrawals' });
        }

        if (!amountCents || amountCents <= 0) {
            return res.status(400).json({ error: 'Invalid withdrawal amount' });
        }

        if (!['bank', 'mobile_money', 'stripe'].includes(method)) {
            return res.status(400).json({ error: 'Invalid withdrawal method' });
        }

        if (!accountDetails) {
            return res.status(400).json({ error: 'Account details are required' });
        }

        // Check available balance
        const availableBalance = await getAvailableBalance(designerId);

        if (amountCents > availableBalance) {
            return res.status(400).json({
                error: 'Insufficient balance',
                availableBalance,
                requestedAmount: amountCents
            });
        }

        // Minimum withdrawal amount (e.g., $10)
        const minimumWithdrawal = 1000; // 1000 cents = $10
        if (amountCents < minimumWithdrawal) {
            return res.status(400).json({
                error: `Minimum withdrawal amount is ${minimumWithdrawal / 100} ${currency}`
            });
        }

        // Encrypt account details
        const encryptedDetails = encrypt(accountDetails);

        // Create withdrawal request
        const withdrawal = await Withdrawal.create({
            designerId,
            amountCents,
            currency,
            method,
            accountDetails: encryptedDetails,
            status: 'pending'
        });

        // TODO: Create notification for admin to process withdrawal

        res.status(201).json({
            message: 'Withdrawal requested',
            withdrawal: {
                id: withdrawal.id,
                amountCents: withdrawal.amountCents,
                currency: withdrawal.currency,
                method: withdrawal.method,
                status: withdrawal.status,
                createdAt: withdrawal.createdAt
            }
        });
    } catch (error) {
        console.error('Request withdrawal error:', error);
        res.status(500).json({ error: 'Failed to request withdrawal' });
    }
};

// Get withdrawals
exports.getWithdrawals = async (req, res) => {
    try {
        const { designerId } = req.query;
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        // Verify authorization
        if (designerId && designerId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const targetDesignerId = designerId || userId;

        const withdrawals = await Withdrawal.findAll({
            where: { designerId: targetDesignerId },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: { exclude: ['accountDetails'] } // Don't expose encrypted details
        });

        // Calculate balances
        const availableBalance = await getAvailableBalance(targetDesignerId);

        const pendingWithdrawals = await Withdrawal.findAll({
            where: {
                designerId: targetDesignerId,
                status: { [Op.in]: ['pending', 'processing'] }
            }
        });

        const pendingBalance = pendingWithdrawals.reduce((sum, w) => sum + w.amountCents, 0);

        res.json({
            withdrawals,
            availableBalance,
            pendingBalance
        });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
};

// Update payment method (save for future use)
exports.updatePaymentMethod = async (req, res) => {
    try {
        const { method, accountDetails } = req.body;
        const userId = req.user.id;

        if (req.user.role !== 'designer') {
            return res.status(403).json({ error: 'Only designers can update payment methods' });
        }

        // Validate method
        if (!['bank', 'mobile_money', 'stripe'].includes(method)) {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        // Store in user's notificationPrefs or create separate PaymentMethod model
        // For now, we'll store in user's notificationPrefs
        const user = await User.findByPk(userId);
        const prefs = user.notificationPrefs || {};

        prefs.paymentMethods = prefs.paymentMethods || {};
        prefs.paymentMethods[method] = encrypt(accountDetails);

        await user.update({ notificationPrefs: prefs });

        res.json({ message: 'Payment method updated' });
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({ error: 'Failed to update payment method' });
    }
};

// Process withdrawal (Admin only)
exports.processWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, transactionId, failureReason } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const withdrawal = await Withdrawal.findByPk(id);

        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ error: 'Withdrawal already processed' });
        }

        if (action === 'approve') {
            // Decrypt account details
            const accountDetails = decrypt(withdrawal.accountDetails);

            // Process based on method
            if (withdrawal.method === 'stripe') {
                // TODO: Implement Stripe Connect transfer
                // const transfer = await stripe.transfers.create({
                //   amount: withdrawal.amountCents,
                //   currency: withdrawal.currency.toLowerCase(),
                //   destination: accountDetails.stripeAccountId
                // });
            } else if (withdrawal.method === 'mobile_money') {
                // TODO: Implement mobile money API integration
                // This would vary by provider (MTN, Vodafone Cash, etc.)
            } else if (withdrawal.method === 'bank') {
                // TODO: Implement bank transfer API
            }

            await withdrawal.update({
                status: 'completed',
                processedAt: new Date(),
                transactionId: transactionId || `TXN-${Date.now()}`
            });

            // Notify designer
            const socketHandler = req.app.get('socketHandler');
            if (socketHandler) {
                socketHandler.sendToUser(withdrawal.designerId, 'withdrawal_completed', {
                    withdrawalId: withdrawal.id,
                    amount: withdrawal.amountCents,
                    currency: withdrawal.currency
                });
            }

            res.json({ message: 'Withdrawal approved and processed', withdrawal });
        } else if (action === 'reject') {
            await withdrawal.update({
                status: 'failed',
                processedAt: new Date(),
                failureReason: failureReason || 'Rejected by admin'
            });

            // Notify designer
            const socketHandler = req.app.get('socketHandler');
            if (socketHandler) {
                socketHandler.sendToUser(withdrawal.designerId, 'withdrawal_failed', {
                    withdrawalId: withdrawal.id,
                    reason: failureReason
                });
            }

            res.json({ message: 'Withdrawal rejected', withdrawal });
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Process withdrawal error:', error);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
};

// Cancel withdrawal (before processing)
exports.cancelWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const withdrawal = await Withdrawal.findByPk(id);

        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        if (withdrawal.designerId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ error: 'Cannot cancel processed withdrawal' });
        }

        await withdrawal.update({ status: 'cancelled' });

        res.json({ message: 'Withdrawal cancelled' });
    } catch (error) {
        console.error('Cancel withdrawal error:', error);
        res.status(500).json({ error: 'Failed to cancel withdrawal' });
    }
};
