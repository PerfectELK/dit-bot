// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api')

import { markupKeyboard } from '../types/telegamKeyboard'
import { InjectModel } from '@nestjs/mongoose'
import { UserMessagesRepository } from './repositories/userMessages.repository'
import { UsersRepository } from './repositories/users.repository'
import { User } from './interfaces/user.interface'
import { APP_URL } from '../app.service'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Role } from './interfaces/role.interface'
import { UserMessage } from './interfaces/userMessage.interface'
import { Model } from 'mongoose'

@Injectable()
export class TelegramService implements OnModuleInit {
    private readonly token: string
    public bot: any
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly userMessagesRepository: UserMessagesRepository,
        @InjectModel('Role') private roleModel: Model<Role>
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
            await this.botStartMessage(msg)
        })
        this.bot.onText(/\/options/,async (msg) => {
            await this.botOptionsMessage(msg)
        })
        this.bot.onText(/Опции/, async (msg) => {
            await this.botOptionsMessage(msg)
        })
        this.bot.onText(/Выбор отдела/, async (msg) => {
            await this.runRoleSelectMenu(msg.from.id)
        })

        const roles = await this.roleModel.find()
        roles.forEach((item): void => {
            const re = new RegExp(item.name)
            this.bot.onText(re, async (msg) => {
                await this.userSelectRole(
                    item,
                    msg
                )
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
                name: '1C'
            }
        ])
    }

    async botStartMessage(msg: any): Promise<void>
    {
        const user: User = await this.usersRepository.findOne({
            telegramId: msg.from.id
        })
        if (user.role !== null) {
            this.bot.sendMessage(msg.from.id, 'Ты уже зарегался, че спамишь, кожанный!?')
            return
        }
        await this.runRoleSelectMenu(msg.from.id)
    }

    async botOptionsMessage(msg: any): Promise<void>
    {
        await this.replyMarkup(
            msg.from.id,
            'Вот список доступных опций',
            this.getOptionsButtons()
        )
    }

    async runRoleSelectMenu(chatId: number): Promise<void>
    {
        await this.replyMarkup(
            chatId, 
            'Выбери свой отдел.',
            await this.getRolesButtons()
        )
    }

    getOptionsButtons(): Array<markupKeyboard>
    {
        return [
            {
                text: 'Выбор отдела'
            },
            {
                text: 'Мой ревьювер'
            },
            {
                text: 'Я провожу ревью'
            }
        ]
    }

    async getRolesButtons(): Promise<Array<markupKeyboard>>
    {
        const roles = await this.roleModel.find()
        return roles.map(item => {
            return {
                text: `${item.name}`,
            }
        })
    }

    async replyMarkup(
        chatId: number,
        message: string,
        keys: Array<markupKeyboard>
    ): Promise<void>
    {
        this.bot.sendMessage(chatId, message, {
            reply_markup: {
                'resize_keyboard': true,
                'keyboard': [keys]
            }
        })
    }

    async sendMessageWithHideMarkup(
        chatId: number,
        message: string
    ): Promise<void>
    {
        await this.bot.sendMessage(chatId, message, {
            reply_markup: {
                hide_keyboard: true,
            }
        })
    }

    async userSelectRole(
        role: Role,
        msg: any
    ): Promise<void>
    {
        const user: User = await this.updateUser(msg.from.id, {
            role
        })
        if (!user) {
            return
        }

        await this.sendMessageWithHideMarkup(msg.from.id, `Теперь ты в отделе ${role.name}`)
    }
}