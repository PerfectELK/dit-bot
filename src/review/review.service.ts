import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Review } from './schemas/review.schema'
import { UsersRepository } from '../telegram/repositories/users.repository'
import { Role } from '../telegram/schemas/roles.schema'
import { User } from '../telegram/schemas/user.schema'

@Injectable()
export class ReviewService {

    constructor(
        private readonly usersRepository: UsersRepository,
        @InjectModel(Review.name) private reviewModel: Model<Review>,
        @InjectModel(Role.name) private roleModel: Model<Role>,
    ) {}

    async generateRandomReviewers(): Promise<void>
    {
        await this.clearCurrentReviewers()

        const roles = await this.roleModel.find({})
        const users: User[] = await this.usersRepository.find({})

        roles.forEach(await (async (role: Role)=> {
            const usersByRole: User[] = users.filter((user: User): boolean => {
                return user.role.id === role.id
            })
            const shuffledUsers: User[] = usersByRole
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)

            for (let i = 0; i < shuffledUsers.length; i++) {
                const current: User = shuffledUsers[i]
                let reviewer: User = null
                if (i === shuffledUsers.length - 1) {
                    reviewer = shuffledUsers[0]
                } else {
                    reviewer = shuffledUsers[i + 1]
                }
                const review = new this.reviewModel({
                    user: current,
                    reviewer: reviewer
                })
                await review.save()
            }
        }))
    }


    async clearCurrentReviewers(): Promise<void>
    {
        await this.reviewModel.deleteMany({})
    }

    async test(): Promise<void>
    {
        const reviews = await this.reviewModel.find({})

        // reviews.forEach(await(async (item) => {
        //     const u = item
        //     const uu = await this.usersRepository.findOne(u.user)
        //
        //
        // }))
    }

}