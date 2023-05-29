import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { FilterQuery, Model } from "mongoose"
import { UserMessage, UserMessageDocument } from '../schemas/userMessage.schema'

@Injectable()
export class UserMessagesRepository {
    constructor(@InjectModel(UserMessage.name) private userMessageModel: Model<UserMessageDocument>) {}

    async findOne(userMessageFilterQuery: FilterQuery<UserMessage>): Promise<UserMessage> {
        return this.userMessageModel.findOne(userMessageFilterQuery)
    }

    async find(userMessagesFilterQuery: FilterQuery<UserMessage>): Promise<UserMessage[]> {
        return this.userMessageModel.find(userMessagesFilterQuery)
    }

    async create(userMessage: UserMessage): Promise<UserMessage> {
        const newUser = new this.userMessageModel(userMessage)
        return newUser.save()
    }

    async findOneAndUpdate(userMessageFilterQuery: FilterQuery<UserMessage>, userMessage: Partial<UserMessage>): Promise<UserMessage> {
        return this.userMessageModel.findOneAndUpdate(userMessageFilterQuery, userMessage)
    }
}