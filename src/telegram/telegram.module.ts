import { Module } from '@nestjs/common'
import { TelegramController } from './telegram.controller'
import { TelegramService } from './telegram.service'
import { UserSchema } from './schemas/user.schema'
import { UserMessageSchema } from './schemas/userMessage.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersRepository } from './repositories/users.repository'
import { UserMessagesRepository } from './repositories/userMessages.repository'
import { RoleSchema } from './schemas/roles.schema'
import { ReviewModule } from '../review/review.module'

@Module({
    imports: [
        ReviewModule,
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
            { name: 'UserMessage', schema: UserMessageSchema },
            { name: 'Role', schema: RoleSchema }
        ])
    ],
    controllers: [TelegramController],
    providers: [
        TelegramService,
        UsersRepository,
        UserMessagesRepository
    ]
})
export class TelegramModule {}