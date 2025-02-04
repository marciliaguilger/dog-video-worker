import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { VideoConsumerService } from './video-consumer.service';
import { config } from 'src/config';
import { S3Service } from '../repository/s3-service';
import { VideoService } from 'src/domain/video-processor.service';

export const localConfig = {
  region: config.AWS_REGION,
  endpoint: config.VIDEO_QUEUE_URL,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  }
};

@Module({
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
  controllers: [],
  providers: [VideoConsumerService, S3Service, VideoService],
})
export class VideoConsumerModule {}