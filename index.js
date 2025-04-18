import express from 'express';
import sequelize from './config/db.js';
// import Account from './models/User.js';
// import Todo from './models/Todo.js';
import router from './routes/indexroute.js';
import flash from 'connect-flash';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { associate } from './models/associate.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false ,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    } // Set to true if using HTTPS
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/', router);


sequelize.sync({alter: true})
.then(()=>{
    console.log('all models syncronised successfully ✅');
    app.listen(PORT , ()=>{
        console.log(`server is running on port ${PORT}`)
    });
})
.catch(err=>{
    console.log('error synching models ❌', err)
})
