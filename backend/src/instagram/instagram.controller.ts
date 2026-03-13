import { Controller, Get } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('feed')
  async getFeed() {
    return await this.instagramService.getInstagramFeed();
  }
}