import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private readonly graphUrl = 'https://graph.facebook.com/v19.0';

  constructor(private configService: ConfigService) {}

  async getInstagramFeed() {
    const accessToken = this.configService.get<string>('INSTAGRAM_ACCESS_TOKEN');
    const accountId = this.configService.get<string>('INSTAGRAM_ACCOUNT_ID');

    if (!accessToken || accessToken === 'bekleniyor') {
      this.logger.warn('Instagram Access Token eksik! Lütfen .env dosyasını güncelleyin.');
      return { status: 'error', message: 'Instagram token ayarlanmamış.' };
    }

    try {
      // Instagram Graph API'den medyaları çekiyoruz
      const response = await axios.get(`${this.graphUrl}/${accountId}/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,comments_count,like_count',
          access_token: accessToken,
          limit: 12 // İlk 12 postu çekiyoruz
        },
      });

      this.logger.log('✅ Instagram akışı başarıyla çekildi!');
      return { status: 'success', data: response.data.data };

    } catch (error: any) {
      this.logger.error(`🚨 Instagram API Hatası: ${error.response?.data?.error?.message || error.message}`);
      throw new HttpException(
        'Instagram verileri çekilemedi.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}