// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api')

import { InjectModel } from '@nestjs/mongoose'
import { UserMessagesRepository } from './repositories/userMessages.repository'
import { UsersRepository } from './repositories/users.repository'
import { User } from './schemas/user.schema'
import { APP_URL } from '../app.service'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { UserMessage } from './schemas/userMessage.schema'
import { Role } from './schemas/roles.schema'
import { Model } from 'mongoose'

@Injectable()
export class TelegramService implements OnModuleInit {
    private readonly token: string
    public bot: any
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly userMessagesRepository: UserMessagesRepository,
        @InjectModel(Role.name) private roleModel: Model<Role>
    ) {
        this.token = process.env.TELEGAM_TOKEN
        this.bot = new TelegramBot(this.token, {
            webHook: true
        })
        this.enableWebHooks()
    }

    async onModuleInit(): Promise<any> {
        await this.seedRolesIsNeed()
    }

    async enableWebHooks() {
        await this.bot.setWebHook(`${APP_URL}/telegram/message`)
        this.bot.onText(/\/start/,async (msg) => {
            const user: User = await this.usersRepository.findOne({
                telegramId: msg.from.id
            })
            if (user.role !== null) {
                this.bot.sendMessage('Ты уже зарегался, че спамишь, кожанный!?')
                return
            }
            const roles = await this.roleModel.find()
            this.bot.sendMessage(msg.from.id, 'Well♂CUM♂!\n\rВыбери свой отдел.', {
                'reply_markup': {
                    'resize_keyboard': true,
                    'inline_keyboard': [
                        roles.map(item => {
                            return {
                                text: `Отдел ${item.name}`,
                                callback_data: `/select-role-${item.id}`
                            }
                        })
                    ]
                }
            })
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
            messages: [],
            reviewer: null,
            role: null
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

    async seedRolesIsNeed(): Promise<void> {
        const roles = await this.roleModel.find()
        if (roles.length > 0) {
            return
        }

        await this.roleModel.insertMany([
            {
                id: 1,
                name: 'Web'
            },
            {
                id: 2,
                name: '1ASS'
            }
        ])
    }
}