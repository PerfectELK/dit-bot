import mongoose from 'mongoose'
export const UserSchema = new mongoose.Schema({
    telegramId: Number,
    firstName: String,
    lastName: String,
    userName: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserMessage' }],
    is_active: Boolean
})