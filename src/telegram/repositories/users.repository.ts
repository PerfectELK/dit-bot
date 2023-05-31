import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from '../interfaces/user.interface'
import { FilterQuery, Model } from 'mongoose'

@Injectable()
export class UsersRepository {
    constructor(@InjectModel('User') private userModel: Model<User>) {}

    async findOne(userFilterQuery: FilterQuery<User>): Promise<User> {
        return this.userModel.findOne(userFilterQuery).exec()
    }

    async find(usersFilterQuery: FilterQuery<User>): Promise<User[]> {
        return this.userModel.find(usersFilterQuery)
    }

    async aggregate(aggregateQuery): Promise<any> {
        return this.userModel.aggregate(aggregateQuery)
    }

    async create(user: Partial<User>): Promise<User> {
        const newUser = new this.userModel(user)
        return newUser.save()
    }

    async findOneAndUpdate(userFilterQuery: FilterQuery<User>, user: Partial<User>): Promise<User> {
        return this.userModel.findOneAndUpdate(userFilterQuery, user)
    }
}