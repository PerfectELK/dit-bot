import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { UserMessage } from './userMessage.schema'
import { Role } from './roles.schema'


export type UserDocument = User & Document

@Schema({
    timestamps: true,
})
export class User extends Document {

  @Prop()
      telegramId: number

  @Prop()
      firstName: string

  @Prop()
      lastName: string

  @Prop()
      userName: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
      role: Role

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'UserMessage' })
      messages: UserMessage[]

}

export const UserSchema = SchemaFactory.createForClass(User)