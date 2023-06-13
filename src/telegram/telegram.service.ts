// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api')
import { Review } from '../review/interfaces/review.interface'
import { ReviewService } from '../review/review.service'
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
    private admin_chat_ids: number[]
    constructor(
        private readonly reviewService: ReviewService,
        private readonly usersRepository: UsersRepository,
        private readonly userMessagesRepository: UserMessagesRepository,
        @InjectModel('Role') private roleModel: Model<Role>,
        @InjectModel('Review') private reviewModel: Model<Review>,
    ) {
        this.token = process.env.TELEGAM_TOKEN
        this.bot = new TelegramBot(this.token, {
            webHook: true
        })
        this.admin_chat_ids = process.env.TELEGRAM_ADMINS.split(',').map((item) => {
            return parseInt(item)
        })
        this.enableWebHooks()
    }

    async onModuleInit(): Promise<any> {
        await this.seedRolesIsNeed()
    }

    async enableWebHooks() {
        await this.bot.setWebHook(`${APP_URL}/telegram/message/${process.env.APP_KEY}`)
        this.bot.onText(/\/start/,async (msg): Promise<void> => {
            await this.botStartMessage(msg)
        })
        this.bot.onText(/\/options/,async (msg): Promise<void> => {
            await this.botOptionsMessage(msg)
        })
        this.bot.onText(/Опции/, async (msg): Promise<void> => {
            await this.botOptionsMessage(msg)
        })
        this.bot.onText(/Выбор отдела/, async (msg): Promise<void> => {
            await this.runRoleSelectMenu(msg.from.id)
        })

        const roles = await this.roleModel.find()
        roles.forEach((item): void => {
            const re = new RegExp(item.name)
            this.bot.onText(re, async (msg): Promise<void> => {
                await this.userSelectRole(
                    item,
                    msg
                )
            })
        })

        this.bot.onText(/\/reviewers_generate/, async(msg): Promise<void> => {
            if (!this.admin_chat_ids.includes(msg.from.id)) {
                return
            }

            await this.reviewService.generateRandomReviewers()
            await this.sendAllReviewInfo()
        })

        this.bot.onText(/\/my_reviewer/, async(msg): Promise<void> => {
            await this.getMyReviewer(msg)
        })
        this.bot.onText(/Мой ревьювер/, async(msg): Promise<void> => {
            await this.getMyReviewer(msg)
        })

        this.bot.onText(/\/i_reviewer/, async(msg): Promise<void> => {
            await this.getUsersWhoIReview(msg)
        })
        this.bot.onText(/Я провожу ревью/, async(msg): Promise<void> => {
            await this.getUsersWhoIReview(msg)
        })

        this.bot.onText(/\/disable_user/, async(msg): Promise<void> => {
            await this.disableUser(msg)
        })

        this.bot.onText(/\/enable_user/, async(msg): Promise<void> => {
            await this.enableUser(msg)
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
            role: null,
            is_active: true
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

    async sendAllReviewInfo(): Promise<void> {
        const reviews: Review[] = await this.reviewModel.aggregate([
            {
                '$lookup': {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user'},
            {
                '$lookup': {
                    from: 'users',
                    localField: 'reviewer',
                    foreignField: '_id',
                    as: 'reviewer'
                }
            },
            { $unwind: '$reviewer'},
        ])

        for (const value of reviews) {
            const user = value.user
            const reviewer = value.reviewer

            await this.bot.sendMessage(user.telegramId, `Твой код проверяет @${reviewer.userName}`)
            await this.bot.sendMessage(reviewer.telegramId, `Ты проверяешь код @${user.userName}`)
        }
    }


    async getMyReviewer(msg): Promise<void> {
        const user: User = await this.usersRepository.findOne({
            telegramId: msg.from.id
        })
        if (!user) {
            return
        }

        const reviews: Review[] = await this.reviewModel.aggregate([
            {
                '$lookup': {
                    from: 'users',
                    localField: 'reviewer',
                    foreignField: '_id',
                    as: 'reviewer'
                }
            },
            { $unwind: '$reviewer'},
            {
                $match: { user: user._id }
            }
        ])

        if (!reviews.length) {
            return
        }

        for (const review of reviews) {
            await this.bot.sendMessage(msg.from.id, `Твой код проверяет @${review.reviewer.userName}`)
        }
    }

    async getUsersWhoIReview(msg): Promise<void> {
        const user: User = await this.usersRepository.findOne({
            telegramId: msg.from.id
        })
        if (!user) {
            return
        }

        const reviews: Review[] = await this.reviewModel.aggregate([
            {
                '$lookup': {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user'},
            {
                $match: { reviewer: user._id }
            }
        ])

        if (!reviews.length) {
            return
        }

        for (const review of reviews) {
            await this.bot.sendMessage(msg.from.id, `Ты проверяешь код @${review.user.userName}`)
        }
    }

    async disableUser(msg): Promise<void> {
        if (!this.admin_chat_ids.includes(msg.from.id)) {
            return
        }

        const userNickname = msg.text.substring(msg.text.indexOf('/disable_user') + '/disable_user'.length).trim().replace('@', '')
        const user: User = await this.usersRepository.findOne({
            userName: userNickname
        })

        if (!user || !user.is_active) {
            return
        }

        user.is_active = false
        await user.save()
        await this.bot.sendMessage(user.telegramId, 'Я запрещаю тебе участвовать в код-ревью')
    }

    async enableUser(msg): Promise<void> {
        if (!this.admin_chat_ids.includes(msg.from.id)) {
            return
        }

        const userNickname = msg.text.substring(msg.text.indexOf('/enable_user') + '/enable_user'.length).trim().replace('@', '')
        const user: User = await this.usersRepository.findOne({
            userName: userNickname
        })

        if (!user || user.is_active) {
            return
        }

        user.is_active = true
        await user.save()
        await this.bot.sendMessage(user.telegramId, 'Я запрещаю тебе <b>не участвовать</b> в код-ревью', { parse_mode : 'HTML' })
    }
}