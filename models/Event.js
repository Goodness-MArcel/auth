import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Account from './User.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  allDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3788d8'
  }
});

// Define relationship with User
Event.belongsTo(Account, { foreignKey: 'accountId' });
Account.hasMany(Event, { foreignKey: 'accountId' });

export default Event;