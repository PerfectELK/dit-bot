import { Document } from 'mongoose'
import { Role } from './role.interface'
import { UserMessage } from './userMessage.interface'

export interface User extends Document {
    telegramId: number,
    firstName: string,
    lastName: string,
    userName: string,
    role: Role['_id'],
    messages: UserMessage['_id'][],
    is_active: boolean,
}