import { Document } from 'mongoose'
import { User } from '../../telegram/interfaces/user.interface'
export interface Review extends Document {
    user: User['_id'],
    reviewer: User['_id'],
}