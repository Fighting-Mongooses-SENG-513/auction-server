import mongoose, { Schema, Document } from 'mongoose';

export interface Auction extends Document {
    name: String,
    currentBid: Number,
    currentHighestBidderEmail: String,
    buyoutPrice?: Number,
    endTime: Date,
    imageUrl: String,
    winnerEmail?: String,
    tags: Array<String>,
    bidderEmailList: Array<String>,
}

const AuctionSchema: Schema = new Schema({
    name: { type: String, required: true },
    currentBid: { type: Number, required: true },
    currentHighestBidderEmail: { type: String },
    buyoutPrice: { type: Number },
    endTime: { type: Date, required: true },
    imageUrl: { type: String, required: true },
    winnerEmail: { type: String },
    tags: { type: Array, required: true },
    bidderEmailList: { type: Array, required: true },
});

export default mongoose.model<Auction>('Auction', AuctionSchema);
