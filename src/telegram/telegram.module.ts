import { Module } from '@nestjs/common'
import { TelegramController } from './telegram.controller'
import { TelegramService } from './telegram.service'
import { UserSchema, User } from './schemas/user.schema'
import { UserMessageSchema, UserMessage } from './schemas/userMessage.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersRepository } from './repositories/users.repository'
import { UserMessagesRepository } from './repositories/userMessages.repository'
import { Role, RoleSchema } from './schemas/roles.schema'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserMessage.name, schema: UserMessageSchema },
            { name: Role.name, schema: RoleSchema }
        ])
    ],
    controllers: [TelegramController],
    providers: [TelegramService, UsersRepository, UserMessagesRepository]
})
export class TelegramModule {}