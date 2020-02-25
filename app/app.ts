import express = require('express');
import bodyParser = require('body-parser');

class App {
    public app: express.Application;
    public port: number;

    constructor(routes: any[], port: number) {
        this.app = express();
        this.port = port;

        this.initMiddleware();
        this.initRoutes(routes);
    }

    private initMiddleware() {
        this.app.use(bodyParser.json());
    }

    private initRoutes(routes: any[]) {
        routes.forEach(route => {
            this.app.use('/', route.router);
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log('Server running on port ' + this.port);
        });
    }
}

export default App;