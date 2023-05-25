import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'


@Schema({
    timestamps: true,
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

}

export const UserSchema = SchemaFactory.createForClass(User)