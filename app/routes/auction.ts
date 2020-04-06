import express = require('express');
import Auction from '../models/auction.model';
import { authMiddleware } from '../middleware/auth';

class AuctionRoute {
    path = '/auctions';
    router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.index);
        this.router.post(this.path, authMiddleware, this.create);
        this.router.post(`${this.path}/:auctionId/bid`, authMiddleware, this.bid);
        this.router.post(`${this.path}/search`, authMiddleware, this.search);
    }

    index(req: express.Request, res: express.Response) {

        let auctioneer = res.locals.auctioneer;

        if(auctioneer){

            Auction.find({ 'auctioneerEmail': res.locals.email }).then(result => {
                return res.status(200).json({
                    result
                });
            }).catch(error => {
                console.error(error);
                return res.status(500).json({ message: 'Failed to retrieve auctions from DB.' })
            });


        } else {
            Auction.find().then(result => {
                return res.status(200).json({
                    result
                });
            }).catch(error => {
                console.error(error);
                return res.status(500).json({ message: 'Failed to retrieve auctions from DB.' })
            });
        }
    }

    create(req: express.Request, res: express.Response) {
        const name = req.body.name;
        const auctioneerEmail = res.locals.email;
        const currentBid = req.body.currentBid;
        let buyoutPrice = req.body.buyoutPrice;
        const auctionDays = req.body.auctionDays;
        const imageUrl = req.body.imageUrl;
        const tags = req.body.tags;
        const bidderEmailList: Array<String> = [];

        const validationErrors = [];
        if (!name || typeof name !== 'string') {
            validationErrors.push('missing or invalid attribute: name');
        }

        if (!auctioneerEmail || typeof auctioneerEmail !== 'string') {
            validationErrors.push('missing or invalid attribute: auctioneerEmail');
        }

        if ((!currentBid && currentBid !== 0.0) || typeof currentBid !== 'number') {
            validationErrors.push('missing or invalid attribute: currentBid');
        }

        if (buyoutPrice && typeof buyoutPrice !== 'number') {
            validationErrors.push('invalid attribute: buyoutPrice');
        }

        if (!auctionDays || typeof auctionDays !== 'number' || auctionDays < 1) {
            validationErrors.push('missing or invalid attribute: auctionDays');
        }

        if (!imageUrl) {
            validationErrors.push('missing or invalid attribute: imageUrl');
        }

        if (!Array.isArray(tags)) {
            validationErrors.push('missing or invalid attribute: tags');
        } else if (tags.some(tag => typeof tag !== 'string')) {
            validationErrors.push('invalid attribute: tags - all tags must be strings')
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors })
        }

        buyoutPrice = buyoutPrice ? buyoutPrice : null;

        const endTime = new Date();
        endTime.setDate(endTime.getDate() + auctionDays);

        const auction = new Auction({
            name,
            auctioneerEmail,
            currentBid,
            buyoutPrice,
            endTime,
            imageUrl,
            tags,
            bidderEmailList
        });
        
        auction.save().then(result => {
            req.app.locals.socketServer.emit('update');
            return res.status(200).json({ result });
        }).catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Failed to save auction to DB' })
        });
    }

    bid(req: express.Request, res: express.Response) {
        let bid = req.body.bid;
        const auctionId = req.params.auctionId;
        const bidderEmail = res.locals.email;

        const validationErrors = [];
        if (!bid || typeof bid !== 'number') {
            validationErrors.push('missing or invalid attribute: bid');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors })
        }

        Auction.findById(auctionId).then(auction => {
            if (!auction) {
                return res.status(400).json({ errors: ['no auction found'] });
            } else if (bid <= auction.currentBid) {
                return res.status(400).json({ errors: ['bid must be greater than the auctions current bid'] });
            } else if (auction.endTime.getTime() < Date.now() || auction.winnerEmail) {
                return res.status(400).json({ errors: ['bid cannot be placed on an auction that has ended'] });
            } else {
                if (auction.buyoutPrice && bid >= auction.buyoutPrice) {
                    bid = auction.buyoutPrice;
                    auction.winnerEmail = bidderEmail;
                }

                if (!auction.bidderEmailList.find(email => email === bidderEmail)) {
                    auction.bidderEmailList.push(bidderEmail);
                }

                auction.currentBid = bid;
                auction.currentHighestBidderEmail = bidderEmail;

                auction.save().then(result => {
                    req.app.locals.socketServer.emit('update');
                    return res.status(200).json({ result });
                }).catch(error => {
                    console.error(error);
                    return res.status(500).json({ message: 'failed to save auction to DB' });
                });
            }
        }).catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'failed to retrieve auction from DB' });
        });
    }
    
    search(req: express.Request, res: express.Response) {
        if (!req.body.search) {
            return res.status(400).json({message: 'Bad Request'});
        } else {
            let query = {$text: {$search: req.body.search}};
            Auction.find(query).then(result => {
                return res.status(200).json({ result });
            }).catch(error => {
                console.error(error);
                return res.status(500).json({message: 'Server Error'});
            });
        }
    }

    static endAuctions( app: express.Application ) {
        const currentTime = new Date();
        Auction.find({endTime: {$lt: currentTime}, winnerEmail: null}).then((endedAuctions) => {
            endedAuctions.forEach((auction) => {
                const winnerEmail = auction.currentHighestBidderEmail ? auction.currentHighestBidderEmail : auction.auctioneerEmail;
                auction.winnerEmail = winnerEmail;
                auction.save().catch((error) => {
                    console.error(error);
                });
            });
            if (endedAuctions.length > 0 && app.locals.socketServer){
                app.locals.socketServer.emit('update');
            }
        });
    }
}

export default AuctionRoute;
