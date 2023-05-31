import { Injectable } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

ConfigModule.forRoot({
    envFilePath: '.env',
})
export const APP_URL: string = process.env.APP_URL
@Injectable()
export class AppService {}
