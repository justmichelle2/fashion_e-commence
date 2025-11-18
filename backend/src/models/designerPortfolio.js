const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const DesignerPortfolio = sequelize.define('DesignerPortfolio', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    designerId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    images: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    visibility: { type: DataTypes.ENUM('public', 'private'), defaultValue: 'public' },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'designer_portfolios',
    timestamps: true,
  })

  return DesignerPortfolio
}
