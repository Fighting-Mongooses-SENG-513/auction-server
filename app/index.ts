import App from './app';
import UserRoute from './routes/user';
import AuctionRoute from './routes/auction';
import io = require('socket.io');

const app = new App(
    [
        new UserRoute(),
        new AuctionRoute()
    ],
    [
        { function: AuctionRoute.endAuctions, interval: 10 * 1000 }
    ],
    3000
);

const socketServer = io(app.listen());

socketServer.origins('*:*');
socketServer.on('connection', (socket: any) => {
    console.log('a user connected');
    socket.emit('hello', "hello there");

});

//adds the socket server to the app's locals so the routes can fire events
app.app.locals.socketServer = socketServer;


