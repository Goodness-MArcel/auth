import { DataTypes, UUID } from "sequelize";
import sequelize from "../config/db.js";

const Todo = sequelize.define('Todo', {
    Todo_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true,
        allowNull: false,
    },
    title:{
        type: DataTypes.STRING,
        allowNull: false ,
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    accountId: {
        type: DataTypes.UUID,
        references: {
            model: 'Accounts',
            key: 'id'
        }
    }
});

Todo.associate = (models)=>{
    Todo.belongsTo(models.Account,{
        foreignKey: 'accountId',
        as: 'account'
    })
}


export default Todo;