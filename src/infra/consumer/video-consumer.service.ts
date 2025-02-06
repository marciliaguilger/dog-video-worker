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
import * as fs from 'fs';
import * as archiver from 'archiver';
import { VideoService } from 'src/domain/video-processor.service';
import { v4 as uuidv4 } from 'uuid';
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
    
    const downloadPath = '/tmp/video.mp4';
    const framesDir = '/tmp/frames';
    const fileName = `${uuidv4()}.zip`;
    const zipPath = `/tmp/${fileName}`;

    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir);
    }
    
    console.log('downloading video...')
    await this.s3Service.downloadVideoFromS3(queuePayload.sourceBucketName, queuePayload.fileId, downloadPath);

    console.log('extracting frames...')
    const frames = await this.videoService.extractFrames(downloadPath, framesDir);
    
    console.log('creating zip...')
    await this.zipFiles(framesDir, zipPath)
    
    console.log('uploading to s3...')
    await this.s3Service.uploadZipToS3(zipPath, queuePayload.targetBucketName, fileName);
  }

  private async zipFiles(sourceDir: string, outPath: string) {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip');

    return new Promise((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', err => reject(err))
        .pipe(output);

      output.on('close', resolve);
      archive.finalize();
      console.log('finalizou');
    });
  }
  
  @SqsConsumerEventHandler(config.VIDEO_QUEUE_NAME, 'processing_error')
  public async onProcessingError(error: Error, message: Message) {
    console.log(error, message);
    try {
      const payload: VideoQueuePayload = JSON.parse(
        message.Body,
      ) as VideoQueuePayload;

    } catch (error) {
      console.log(`error handling error`, error);
    }
  }
}