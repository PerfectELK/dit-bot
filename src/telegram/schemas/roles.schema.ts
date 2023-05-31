import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({
    timestamps: true
})
export class Role {

  @Prop()
      id: number

  @Prop()
      name: string
}

export const RoleSchema = SchemaFactory.createForClass(Role)