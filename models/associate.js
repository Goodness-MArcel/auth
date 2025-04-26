import Account from "./User.js";
import Todo from "./Todo.js";
import Activity from "./Activity.js";
import Event from './Event.js';

export const associate = () => {
    if (Account.associate) {
        Account.associate({ Todo });
    }
    if (Todo.associate) {
        Todo.associate({ Account });
    }
};
