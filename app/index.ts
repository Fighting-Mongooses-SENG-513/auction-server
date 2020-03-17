import App from './app';
import UserRoute from './routes/user';
import AuctionRoute from './routes/auction';

const app = new App(
    [
        new UserRoute(),
        new AuctionRoute()
    ],
    3000
);

app.listen();
