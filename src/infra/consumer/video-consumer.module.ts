import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { VideoConsumerService } from './video-consumer.service';
import { config } from 'src/config';
import { S3Service } from '../repository/s3-service';
import { VideoService } from 'src/domain/video-processor.service';
import { DogVideoApiModule } from '../client/dog-video-api.module';

@Module({
  providers: [
    DogVideoApiModule,
    VideoConsumerService,
    S3Service, 
    VideoService,
  ],
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: config.VIDEO_QUEUE_NAME,
          queueUrl: config.VIDEO_QUEUE_URL,
          region: config.AWS_REGION,
        },
      ],
      producers: [],
    }),
    
  ],
  controllers: []
})
export class VideoConsumerModule {}