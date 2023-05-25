// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api')
import { APP_URL } from './app.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TelegramService {
    private readonly token: string
    public bot: any
    constructor() {
        this.token = process.env.TELEGAM_TOKEN
        this.bot = new TelegramBot(this.token)
        this.enableWebHooks()
    }

    enableWebHooks(): void {
        this.bot.setWebHook(`${APP_URL}/telegram/ping`)
        this.bot.onText(/\/start/, msg => {
            this.bot.sendMessage(msg.chat.id, 'Ты лох')
        })
    }
}
