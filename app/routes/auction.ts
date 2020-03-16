import express = require('express');
import Auction from '../models/auction.model';

class AuctionRoute {
    path = '/auctions';
    router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(this.path, this.index);
        this.router.post(this.path, this.create);
        this.router.post(`${this.path}/:auctionId/bid`, this.bid);
    }

    index(req: express.Request, res: express.Response) {
        Auction.find().then(result => {
            return res.status(200).json({
                result
            });
        }).catch(error => {
            console.error(error);
            return res.status(500).json({ mesasge: 'Failed to retrieve auctions from DB.' })
        });
    }

    create(req: express.Request, res: express.Response) {
        console.log(req.body);
        const name = req.body.name;
        const currentBid = req.body.currentBid;
        let buyoutPrice = req.body.buyoutPrice;
        const endTime = Date.parse(req.body.endTime);
        const imageUrl = req.body.imageUrl;
        const tags = req.body.tags;
        const bidderEmailList: Array<String> = [];

        const validationErrors = [];
        if (!name || typeof name !== 'string') {
            validationErrors.push('missing or invalid attribute: name');
        }

        if ((!currentBid && currentBid !== 0.0) || typeof currentBid !== 'number') {
            validationErrors.push('missing or invalid attribute: currentBid');
        }

        if (buyoutPrice && typeof buyoutPrice !== 'number') {
            validationErrors.push('invalid attribute: buyoutPrice');
        }

        if (!endTime || endTime < Date.now()) {
            validationErrors.push('missing or invalid attribute: endTime');
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

        const auction = new Auction({
            name,
            currentBid,
            buyoutPrice,
            endTime,
            imageUrl,
            tags,
            bidderEmailList
        });

        auction.save().then(result => {
            return res.status(200).json(result);
        }).catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Failed to save auction to DB' })
        });
    }

    bid(req: express.Request, res: express.Response) {
        const bid = req.body.bid;
        const auctionId = req.params.auctionId;
        const bidderEmail = req.body.bidderEmail;

        const validationErrors = [];
        if (!bid || typeof bid !== 'number') {
            validationErrors.push('missing or invalid attribute: bid');
        }

        if (!bidderEmail || typeof bidderEmail !== 'string') {
            validationErrors.push('missing or invalid attribute: bidderEmail');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors })
        }

        Auction.findById(auctionId).then(auction => {
            if (!auction) {
                return res.status(400).json({ errors: ['no auction found'] });
            } else if (auction && bid <= auction.currentBid) {
                return res.status(400).json({ errors: ['bid must be greater than the auctions current bid'] });
            } else if (auction && auction.endTime.getTime() < Date.now()) {
                return res.status(400).json({ errors: ['bid cannot be placed on an auction that has ended'] });
            } else {
                auction.currentBid = bid;
                auction.currentHighestBidderEmail = bidderEmail;

                if (!auction.bidderEmailList.find(email => email === bidderEmail)) {
                    auction.bidderEmailList.push(bidderEmail);
                }

                auction.save().then(result => {
                    return res.status(200).json(result);
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
}

export default AuctionRoute;
