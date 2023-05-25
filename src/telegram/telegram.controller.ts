import { Controller, Post, Req } from '@nestjs/common'
import { TelegramService } from './telegram.service'

@Controller('telegram')
export class TelegramController {
    constructor(
    private telegramService: TelegramService
    ) {}

  @Post('message')
    ping(@Req() req): string {
        console.log(req.body)
        this.telegramService.bot.processUpdate(req.body)
        return ''
    }
}