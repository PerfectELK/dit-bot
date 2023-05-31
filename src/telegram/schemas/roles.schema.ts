import mongoose from 'mongoose'

export const RoleSchema = new mongoose.Schema({
    id: Number,
    name: String
})