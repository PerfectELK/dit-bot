import { Controller, Post, Req } from '@nestjs/common'
import { TelegramService } from './telegram.service'

@Controller('telegram')
export class TelegramController {
    constructor(
    private telegramService: TelegramService
    ) {}

  @Post('message')
    async ping(@Req() req): Promise<string> {
        console.log(req.body)
        if (req.body.callback_query) {
            // Todo логика колбэков, потом сделаю, а может и нет
            return ''
        }
        const message = req.body.message
        let user = await this.telegramService.getUserByTelegramId(message.from.id)
        if (!user) {
            user = await this.telegramService.createUser(
                message.from.id,
                message.from.first_name,
                message.from.last_name,
                message.from.username,
            )
        }
        user.messages.push(await this.telegramService.createUserMessage(
            message.text,
            message.chat.id,
            user
        ))
        await this.telegramService.updateUser(user.telegramId, user)
        this.telegramService.bot.processUpdate(req.body)
        return ''
    }
}