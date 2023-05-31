import { Document } from 'mongoose'
import { User } from './user.interface'

export interface UserMessage extends Document {
    message: string,
    chatId: number,
    user: User['_id'],
}