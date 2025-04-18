import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Account from '../models/User.js';
import 'dotenv/config';

function AuthenticateToken(req, res, next) {
    const token = req.cookies?.auth_token ;
    
    if(!token) {
        req.flash('error_msg', 'unauthorized ❌');
        return res.redirect('/login');
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            req.flash('error_msg', 'invalid token ❌');
            console.log('invalid token ❌', err);
            return res.redirect('/login');
        }
        req.user = decoded;
        next();
    });
}

export default AuthenticateToken;
