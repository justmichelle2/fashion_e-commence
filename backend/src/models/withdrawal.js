const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Withdrawal = sequelize.define('Withdrawal', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        designerId: { type: DataTypes.UUID, allowNull: false },
        amountCents: { type: DataTypes.INTEGER, allowNull: false },
        currency: { type: DataTypes.STRING, defaultValue: 'USD' },
        method: {
            type: DataTypes.ENUM('bank', 'mobile_money', 'stripe'),
            allowNull: false
        },
        accountDetails: { type: DataTypes.JSON, allowNull: false }, // Encrypted
        status: {
            type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
            defaultValue: 'pending'
        },
        processedAt: { type: DataTypes.DATE },
        transactionId: { type: DataTypes.STRING },
        failureReason: { type: DataTypes.TEXT }
    }, {
        tableName: 'withdrawals',
        timestamps: true,
        indexes: [
            { fields: ['designerId'] },
            { fields: ['status'] },
            { fields: ['createdAt'] }
        ]
    });

    return Withdrawal;
};
