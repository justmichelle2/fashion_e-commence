const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    priceCents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    images: { type: DataTypes.JSON, defaultValue: [] },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    category: { type: DataTypes.STRING },
    inventory: { type: DataTypes.INTEGER, defaultValue: 10 },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    availability: { type: DataTypes.ENUM('in_stock', 'made_to_order', 'preorder'), defaultValue: 'made_to_order' },
    viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    averageRating: { type: DataTypes.FLOAT, defaultValue: 0 }
  }, {
    tableName: 'products',
    timestamps: true
  });

  return Product;
};
