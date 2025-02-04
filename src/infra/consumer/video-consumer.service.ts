import { Injectable } from '@nestjs/common';
import {
  SqsConsumerEventHandler,
  SqsMessageHandler,
} from '@ssut/nestjs-sqs';
import * as AWS from '@aws-sdk/client-sqs';
import { config } from '../.././config';
import { Message } from '@aws-sdk/client-sqs';
import { VideoQueuePayload } from 'src/types/video-queue-payload';
import { S3Service } from '../repository/s3-service';
import * as path from 'path';
import * as tmp from 'tmp';
import { VideoService } from 'src/domain/video-processor.service';

@Injectable()
export class VideoConsumerService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly videoService: VideoService
  ) { }
  @SqsMessageHandler(config.VIDEO_QUEUE_NAME, false)
  async handleMessage(message: AWS.Message) {
    const queuePayload: VideoQueuePayload = JSON.parse(
      message.Body,
    ) as VideoQueuePayload;


    console.log(`Handling request for report ${queuePayload.sourceBucketName}`);
    
    const tempDir = tmp.dirSync({ unsafeCleanup: true });
    const videoPath = path.join(tempDir.name, queuePayload.fileId);

    //let fileBuffer = await this.s3Service.getFile(queuePayload.sourceBucketName, queuePayload.fileId)
    
    //baixar o video do s3
    await this.s3Service.downloadVideoFromS3(queuePayload.sourceBucketName, queuePayload.fileId, videoPath);
    
    //converter o video em imagens
    const frames = await this.videoService.extractFrames(videoPath, tempDir.name);
    
    //gravar as imagens em outro s3
    await this.s3Service.uploadFramesToS3(frames, queuePayload.targetBucketName);
  
    //this.s3Service.uploadFile(queuePayload.targetBucketName, queuePayload.fileId,fileBuffer, null)

  }

  @SqsConsumerEventHandler(config.VIDEO_QUEUE_NAME, 'processing_error')
  public async onProcessingError(error: Error, message: Message) {
    console.log(error, message);
    try {
      const payload: VideoQueuePayload = JSON.parse(
        message.Body,
      ) as VideoQueuePayload;

    } catch (error) {
      // log this error
      console.log(`error handling error`, error);
    }
  }
}