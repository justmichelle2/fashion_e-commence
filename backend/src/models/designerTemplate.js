const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DesignerTemplate = sequelize.define('DesignerTemplate', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    designerId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    coverImage: { type: DataTypes.STRING },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    basePriceCents: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'designer_templates',
    timestamps: true
  });

  return DesignerTemplate;
};
