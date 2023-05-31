import { Controller, Get, Inject, Post, Req } from '@nestjs/common'
import { ReviewService } from './review.service'

@Controller('review')
export class ReviewController {

    constructor(
        private reviewService: ReviewService
    ) {
    }

    @Get('generate')
    async generateReviewers(@Req() req): Promise<string> {
        await this.reviewService.generateRandomReviewers()
        return ''
    }

    @Get('test')
    async test(): Promise<string> {
        await this.reviewService.test()
        return ''
    }

}