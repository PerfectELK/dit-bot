import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'
import { UserMessage } from '../interfaces/userMessage.interface'

@Injectable()
export class UserMessagesRepository {
    constructor(@InjectModel('UserMessage') private userMessageModel: Model<UserMessage>) {}

    async findOne(userMessageFilterQuery: FilterQuery<UserMessage>): Promise<UserMessage> {
        return this.userMessageModel.findOne(userMessageFilterQuery)
    }

    async find(userMessagesFilterQuery: FilterQuery<UserMessage>): Promise<UserMessage[]> {
        return this.userMessageModel.find(userMessagesFilterQuery)
    }

    async create(userMessage: Partial<UserMessage>): Promise<UserMessage> {
        const newUser = new this.userMessageModel(userMessage)
        return newUser.save()
    }

    async findOneAndUpdate(userMessageFilterQuery: FilterQuery<UserMessage>, userMessage: Partial<UserMessage>): Promise<UserMessage> {
        return this.userMessageModel.findOneAndUpdate(userMessageFilterQuery, userMessage)
    }
}