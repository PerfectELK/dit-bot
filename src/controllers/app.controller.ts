import { Controller, Post, Req } from '@nestjs/common'
import { AppService } from '../services/app.service'
import { TelegramService } from '../services/telegram.service'

@Controller('telegram')
export class AppController {
    constructor(
      private readonly appService: AppService,
      private telegramService: TelegramService
    ) {}
    @Post('ping')
    ping(@Req() req): string {
        this.telegramService.bot.processUpdate(req.body)
        return ''
    }
}
