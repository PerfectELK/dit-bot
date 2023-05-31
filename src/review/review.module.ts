import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'

import { MongooseModule } from '@nestjs/mongoose'
import { ReviewSchema } from './schemas/review.schema'
import { UserSchema } from '../telegram/schemas/user.schema'
import { RoleSchema } from '../telegram/schemas/roles.schema'
import { UsersRepository } from '../telegram/repositories/users.repository'
import { ReviewController } from './review.controller'
import mongoose from 'mongoose'

mongoose.set('debug', true)

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
            { name: 'Role', schema: RoleSchema },
            { name: 'Review', schema: ReviewSchema },
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