import express = require('express');
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const jwtKey = '9284C363EE96A915C7E4CEF9DBFD5';
    try {
        const token = req.headers.authorization?.split(" ")[1]; // split after white space Bearer 2asdfgd
        if (!token) {
            return res.status(401).json({message: 'Not Authorized'});
        }
        jwt.verify(token, jwtKey);
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid Token'
        });
    }
};
