import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from "mongoose"
import { UserMessage } from "./userMessage.schema"


export type UserDocument = User & Document

@Schema({
    timestamps: true,
    _id: true
})
export class User {

  @Prop()
      telegramId: number

  @Prop()
      firstName: string

  @Prop()
      lastName: string

  @Prop()
      userName: string

  @Prop({ type: [mongoose.Types.ObjectId], ref: 'UserMessage' })
      messages: UserMessage[]

}

export const UserSchema = SchemaFactory.createForClass(User)