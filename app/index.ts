import App from './app';
import UserRoute from './routes/user';
import AuctionRoute from './routes/auction';

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

app.listen();
