const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT },
    photos: { type: DataTypes.JSON, defaultValue: [] }
  }, {
    tableName: 'reviews',
    timestamps: true
  });

  return Review;
};
