import express = require('express');

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
        res.status(200).json({message: 'User Created'});
    }
}

export default UserRoute;
