// eslint-disable-next-line @typescript-eslint/no-var-requires
import { UserMessagesRepository } from "./repositories/userMessages.repository";

const TelegramBot = require('node-telegram-bot-api')
import { UsersRepository } from "./repositories/users.repository"
import { User } from "./schemas/user.schema"
import { APP_URL } from '../app.service'
import { Injectable } from '@nestjs/common'
import { UserMessage } from "./schemas/userMessage.schema";

@Injectable()
export class TelegramService {
    private readonly token: string
    public bot: any
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly userMessagesRepository: UserMessagesRepository
    ) {
        this.token = process.env.TELEGAM_TOKEN
        this.bot = new TelegramBot(this.token, {
            webHook: true
        })
        this.enableWebHooks()
    }

    async enableWebHooks() {
        const is = await this.bot.setWebHook(`${APP_URL}/telegram/message`)
        this.bot.onText(/\/start/, msg => {
            this.bot.sendMessage(msg.chat.id, 'Кекв')
        })
    }

    async createUser(
        telegramId: number,
        firstName: string,
        lastName: string,
        userName: string,
    ): Promise<User>
    {
        return this.usersRepository.create({
            telegramId,
            firstName,
            lastName,
            userName,
            messages: []
        })
    }

    async updateUser(telegramId: number, userUpdates: Partial<User>): Promise<User>
    {
        return this.usersRepository.findOneAndUpdate({telegramId}, userUpdates)
    }

    async getUserByTelegramId(telegramId: number): Promise<User>
    {
        return this.usersRepository.findOne({ telegramId })
    }

    async createUserMessage(
        message: string,
        chatId: number,
        user: User
    ): Promise<UserMessage>
    {
        return this.userMessagesRepository.create({
            message,
            chatId,
            user
        })
    }
}
