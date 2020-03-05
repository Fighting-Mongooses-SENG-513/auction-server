import express = require('express');
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

class UserRoute {
    private jwtKey = '9284C363EE96A915C7E4CEF9DBFD5' // Never do this in real life
    public path = '/user';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}/login`, this.login);
        this.router.post(`${this.path}/create`, this.createUser);
    }

    login = (req: express.Request, res: express.Response) => {
        req.body.email = req.body.email.toLowerCase();

        User.findOne({email: req.body.email})
            .then(user => {
                if (!user) {
                    return res.status(401).json({message: 'Email does not exist.'});
                } else {
                    bcrypt.compare(req.body.password, user.password)
                        .then(result => {
                            if (!result) {
                                return res.status(401).json({message: 'Incorrect password.'});
                            } else {
                                const token = jwt.sign({email: user.email, auctioneer: user.auctioneer},
                                                        this.jwtKey, 
                                                        {expiresIn: '1h'});
                                return res.status(200).json({
                                    token: token,
                                    expiresIn: 3600
                                });
                            }
                        }).catch(err => {
                            console.log('Error validating password', err);
                            return res.status(500).json({message: 'Server Error'});
                        });
                }
            }).catch(err => {
                console.log('Unable to retrieve user from DB', err);
                return res.status(500).json({message: 'Server Error'});
            });
    }

    createUser = (req: express.Request, res: express.Response) => {
        let userEmail: string = req.body.email.toLowerCase();

        User.findOne({email: userEmail})
            .then(found => {
                if (found) {
                    return res.status(409).json({
                        message: 'Email already exists'
                    });
                } else {
                    bcrypt.hash(req.body.password, 10) // 10 => salt
                        .then(hash => {
                            const user = new User({
                                email: userEmail,
                                password: hash,
                                auctioneer: req.body.auctioneer
                            });
                            user.save().then(result => {
                                const token = jwt.sign({email: result.email, auctioneer: result.auctioneer},
                                                        this.jwtKey,
                                                        {expiresIn: '1h'});
                                return res.status(200).json({
                                    token: token,
                                    expiresIn: 3600 // seconds
                                });
                            }).catch(err => {
                                console.log(err);
                                return res.status(500).json({message: 'Failed to save user to DB'});
                            });
                        }).catch(err => {
                            console.log(err);
                            return res.status(500).json({message: 'Failed to hash password'});
                        });
                }
            }).catch(err => {
                console.log(err);
                return res.status(500).json({message: 'Failed to search DB for user'});
            });
    }
}

export default UserRoute;
