import { Module } from '@nestjs/common'
import { AppController } from './controllers/app.controller'
import { AppService } from './services/app.service'
import { ConfigModule } from '@nestjs/config'
import { TelegramService } from './services/telegram.service'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
    ],
    controllers: [AppController],
    providers: [AppService, TelegramService],
})
export class AppModule {}
