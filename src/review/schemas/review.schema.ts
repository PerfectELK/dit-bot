import mongoose from 'mongoose'

export const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})