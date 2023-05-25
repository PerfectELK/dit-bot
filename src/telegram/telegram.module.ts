import { Module } from '@nestjs/common'
import { TelegramController } from './telegram.controller'
import { TelegramService } from './telegram.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from './schemas/user.schema'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema }
        ])
    ],
    controllers: [TelegramController],
    providers: [TelegramService],
})

export class TelegramModule {}