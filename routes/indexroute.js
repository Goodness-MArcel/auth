import express from 'express';
import AuthenticateToken from '../middleware/jwt.js';
import { 
    signupPage,
     signuplogic,
     loginPage,
     loginlogic, 
      dashboardPage ,
      logOut,
      addTask,
      UserTaskPage
     } from './allroute.js';
const router = express.Router();

router.get('/', signupPage);
router.post('/signup', signuplogic);
router.get('/login', loginPage);
router.post('/login', loginlogic);
router.get('/dashboard/:id', AuthenticateToken, dashboardPage );
router.get('/logout', logOut);


router.post('/task/add/:id', AuthenticateToken, addTask);
router.get('/task/user/:id', AuthenticateToken, UserTaskPage);


export default router;