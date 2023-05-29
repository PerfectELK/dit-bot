import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type RoleDocument = HydratedDocument<Role>

@Schema({
    timestamps: true,
    _id: false
})
export class Role {

  @Prop()
      id: number

  @Prop()
      name: string

}

export const RoleSchema = SchemaFactory.createForClass(Role)