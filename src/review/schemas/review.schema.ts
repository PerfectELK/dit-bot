import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { User } from '../../telegram/schemas/user.schema'

@Schema({
    timestamps: true
})
export class Review extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
        user: User

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User' })
        reviewer: User
}

export const ReviewSchema = SchemaFactory.createForClass(Review)