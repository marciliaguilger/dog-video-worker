import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import * as fs from 'fs';
import * as archiver from 'archiver';
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
    console.log(tempDir)
    //let fileBuffer = await this.s3Service.getFile(queuePayload.sourceBucketName, queuePayload.fileId)
    
    console.log('downloading video...')
    //baixar o video do s3 e salvar no temp
    await this.s3Service.downloadVideoFromS3(queuePayload.sourceBucketName, queuePayload.fileId, videoPath);
    console.log('extracting frames...')
    //converter o video em imagens
    const frames = await this.videoService.extractFrames(videoPath, tempDir.name);
    
    console.log('creating zip...')
    //criar um zip do diretório temp
    const zipPath = path.join(tempDir.name, '/images.zip');

    const resultZipPath = await this.zipDirectory(tempDir.name, zipPath)
    console.log(resultZipPath);
    console.log('uploading to s3...')
    //gravar as imagens em outro s3
    await this.s3Service.uploadZipToS3(zipPath, queuePayload.targetBucketName, queuePayload.fileId);
    //this.s3Service.uploadFile(queuePayload.targetBucketName, queuePayload.fileId,fileBuffer, null)
  }

  async zipDirectory(sourceDir, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(outPath);
  
    return new Promise<void>((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', err => reject(err))
        .pipe(stream)
      ;
  
      stream.on('close', () => resolve());
      archive.finalize();
      console.log('finalizou');
    });
  }


  async createZipFromDirectory(sourceDir: string, zipPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('Verificando se o diretório de origem existe...');
      if (!fs.existsSync(sourceDir)) {
        return reject(new Error(`Diretório fonte não encontrado: ${sourceDir}`));
      }

      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`Arquivamento finalizado, ${archive.pointer()} bytes escritos`);
        resolve(zipPath);
      });

      output.on('end', () => console.log('Streaming concluído.'));

      output.on('error', (err) => {
        console.error('Erro ao gravar o arquivo ZIP:', err);
        reject(err);
      });

      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Aviso de arquivamento:', err);
        } else {
          console.error('Erro crítico:', err);
          reject(err);
        }
      });

      archive.on('error', (err) => {
        console.error('Erro de arquivamento:', err);
        reject(err);
      });

      console.log('Iniciando arquivamento...');
      archive.pipe(output);

      console.log('Adicionando diretório ao ZIP...');
      archive.directory(sourceDir, false);

      console.log('Finalizando arquivamento...');
      archive.finalize().catch(err => {
        console.error('Erro ao finalizar o ZIP:', err);
        reject(err);
      });
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
      // log this error
      console.log(`error handling error`, error);
    }
  }
}