import App from './app';
import UserRoute from './routes/user';
import AuctionRoute from './routes/auction';
import io = require('socket.io');

const app = new App(
    [
        new UserRoute(),
        new AuctionRoute()
    ],
    [],
    3000
);

// need a reference to the app from the static function for the socketServer
app.addJob({ function: function() { AuctionRoute.endAuctions(app.app) }, interval: 10 * 1000 })

const socketServer = io(app.listen());

socketServer.origins('*:*');
socketServer.on('connection', (socket: any) => {
// for future socket features
});

//adds the socket server to the app's locals so the routes can fire events
app.app.locals.socketServer = socketServer;


