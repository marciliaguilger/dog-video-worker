import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IDogVideoApiClient } from 'src/domain/service/dog-video-service.interface';
import { DogVideoApiClient } from './dog-video-api.client';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('TIMEOUT'),
        maxRedirects: configService.get('MAX_REDIRECTS'),
        baseURL: configService.get('DOG_VIDEO_API_URL'),
        headers: {
          'X-Requester-Token': configService.get('REQUESTER_TOKEN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    DogVideoApiClient,
    {
      provide: IDogVideoApiClient,
      useClass: DogVideoApiClient,
    },
  ],
  exports: [IDogVideoApiClient],
})
export class DogVideoApiModule {}
