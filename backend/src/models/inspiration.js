const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Inspiration = sequelize.define('Inspiration', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    visibility: { type: DataTypes.ENUM('public', 'private'), defaultValue: 'public' },
    media: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  }, {
    tableName: 'inspirations',
    timestamps: true,
  })

  return Inspiration
}
