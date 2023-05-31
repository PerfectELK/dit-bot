import mongoose from 'mongoose'

export const UserMessageSchema = new mongoose.Schema({
    message: String,
    chatId: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})