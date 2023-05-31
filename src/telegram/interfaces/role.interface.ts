import { Document } from 'mongoose'

export interface Role extends Document {
    readonly name: string
    readonly id: number
}