import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Account from './User.js';

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Define relationship with User
Activity.belongsTo(Account, { foreignKey: 'accountId' });
Account.hasMany(Activity, { foreignKey: 'accountId' });

export default Activity;