import express = require('express');
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

class UserRoute {
    public path = '/user';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(this.path, this.login);
        this.router.post(`${this.path}/create`, this.createUser);
    }

    login = (req: express.Request, res: express.Response) => {

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
                                password: hash
                            });
                            user.save().then(result => {
                                const token = jwt.sign({email: result.email},
                                                        '9284C363EE96A915C7E4CEF9DBFD5', // Random key for encryption
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
                return res.status(500).json({message: 'Failed to searcj DB for user'});
            })
    }
}

export default UserRoute;
