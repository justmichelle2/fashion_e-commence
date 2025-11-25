const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('customer', 'designer', 'admin'), defaultValue: 'customer' },
    bio: { type: DataTypes.TEXT },
    verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    avatarUrl: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    preferredCurrency: { type: DataTypes.STRING, defaultValue: 'USD' },
    preferredLocale: { type: DataTypes.STRING, defaultValue: 'en' },
    preferredSize: { type: DataTypes.STRING },
    measurementProfile: { type: DataTypes.JSON, defaultValue: {} },
    notificationPrefs: { type: DataTypes.JSON, defaultValue: { email: true, sms: false, push: true } },
    onboardingComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
    portfolioUrl: { type: DataTypes.STRING },
    styleNotes: { type: DataTypes.TEXT },
    pronouns: { type: DataTypes.STRING },
    // KYC fields
    kycStatus: { type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'), defaultValue: 'none' },
    idDocuments: { type: DataTypes.JSON, defaultValue: [] }
  }, {
    tableName: 'users',
    timestamps: true,
  });

  User.prototype.setPassword = async function (password) {
    this.passwordHash = await bcrypt.hash(password, 10);
  }

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  return User;
};
