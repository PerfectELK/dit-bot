import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'

import { MongooseModule } from '@nestjs/mongoose'
import { Review, ReviewSchema } from './schemas/review.schema'
import { User, UserSchema } from '../telegram/schemas/user.schema'
import { Role, RoleSchema } from '../telegram/schemas/roles.schema'
import { UsersRepository } from '../telegram/repositories/users.repository'
import { ReviewController } from './review.controller'
import mongoose from 'mongoose'

mongoose.set('debug', true)

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Review.name, schema: ReviewSchema },
        ])
    ],
    controllers: [
        ReviewController
    ],
    providers: [
        ReviewService,
        UsersRepository
    ],
    exports: [ReviewService]
})
export class ReviewModule {}