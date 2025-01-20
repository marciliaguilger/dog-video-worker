import { Injectable } from '@nestjs/common';
import {
  SqsConsumerEventHandler,
  SqsMessageHandler,
} from '@ssut/nestjs-sqs';
import * as AWS from '@aws-sdk/client-sqs';
import { config } from '../.././config';
import { Message } from '@aws-sdk/client-sqs';
import { VideoQueuePayload } from 'src/types/video-queue-payload';

@Injectable()
export class VideoConsumerService {
  @SqsMessageHandler(config.VIDEO_QUEUE_NAME, false)
  async handleMessage(message: AWS.Message) {
    // parse queue payload
    const queuePayload: VideoQueuePayload = JSON.parse(
      message.Body,
    ) as VideoQueuePayload;

    //baixar o video do s3
    //converter o video em imagens
    //gravar as imagens em outro s3
    console.log(`Handling request for report ${queuePayload.id}`);
    console.log(`Handling request for report ${queuePayload.path}`);
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