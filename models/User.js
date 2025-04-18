import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Account = sequelize.define('Account' ,{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Account.associate = (models) =>{
    Account.hasOne(models.Todo , {
        foreignKey: 'accountId',
        as: 'todo',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
}

export default Account;