import express = require('express');
import bodyParser = require('body-parser');
import mongoose from 'mongoose';

class App {
    public app: express.Application;
    public port: number;
    public mongoConnection: string = 'mongodb+srv://fightingMongoose:02hGHEQ3WbO1mjIV@cluster0-wrbvu.mongodb.net/test?retryWrites=true&w=majority';

    constructor(routes: any[], port: number) {
        this.app = express();
        this.port = port;

        this.initMiddleware();
        this.initRoutes(routes);
        this.initDB();
    }

    private initMiddleware() {
        this.app.use(bodyParser.json());
    }

    private initRoutes(routes: any[]) {
        routes.forEach(route => {
            this.app.use('/', route.router);
        });
    }

    private initDB() {
        mongoose.Promise = global.Promise;
        mongoose.connect(this.mongoConnection, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log('Mongo connection suceeded.');
        })
        .catch(() => {
            console.log('Mongo connection failed.');
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log('Server running on port ' + this.port);
        });
    }
}

export default App;