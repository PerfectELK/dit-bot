import { Controller, Post, Req } from '@nestjs/common'
import { TelegramService } from './telegram.service'
import { UserDocument } from "./schemas/user.schema";

@Controller('telegram')
export class TelegramController {
    constructor(
    private telegramService: TelegramService
    ) {}

  @Post('message')
    async ping(@Req() req): Promise<string> {
        this.telegramService.bot.processUpdate(req.body)
        console.log(req.body)
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
        return ''

    }
}