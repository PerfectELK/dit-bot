// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api')

import { markupKeyboard } from '../types/telegamKeyboard'
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
        this.bot.onText(/\/start/, (msg) => {
            this.botStartMessage(msg)
        })
        this.bot.onText(/\/options/, (msg) => {
            this.botOptionsMessage(msg)
        })
        this.bot.onText(/Опции/, (msg) => {
            this.botOptionsMessage(msg)
        })

        const roles = await this.roleModel.find()
        roles.forEach((item): void => {
            const re = new RegExp(item.name)
            this.bot.onText(re, (msg) => {
                this.userSelectRole(
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
            messages: [],
            role: null,
            reviewer: null,
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
            'Well♂CUM♂!\n\rВыбери свой отдел.',
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

    async hideCustomMarkup(
        chatId: number
    ): Promise<void>
    {
        // Todo скрытие кастомных кнопок
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
        this.bot.sendMessage(msg.from.id, `Теперь ты в отделе ${role.name}`)
    }
}