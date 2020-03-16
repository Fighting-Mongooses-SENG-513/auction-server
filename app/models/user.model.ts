import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
    email: string;
    password: string;
    auctioneer: boolean;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    auctioneer: { type: Boolean, required: true }
});

export default mongoose.model<User>('User', UserSchema);