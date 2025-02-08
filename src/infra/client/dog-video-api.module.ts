import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDogVideoFilesService } from 'src/domain/service/dog-video-service.interface';
import { DogVideoApiClient } from './dog-video-api.client';

@Module({
  imports: [
    HttpModule.registerAsync({
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
      provide: IDogVideoFilesService,
      useClass: DogVideoApiClient,
    },
  ],
  exports: [DogVideoApiClient],
})
export class DogVideoApiModule {}
