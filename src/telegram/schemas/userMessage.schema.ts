import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User } from './user.schema'
import mongoose, { Document } from 'mongoose'


export type UserMessageDocument = UserMessage & Document
@Schema({
    timestamps: true,
    _id: true
})
export class UserMessage {

  @Prop()
      message: string

  @Prop()
      chatId: number

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}])
      user: User

}

export const UserMessageSchema = SchemaFactory.createForClass(UserMessage)