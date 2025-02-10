
import { Injectable, Logger } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({});
  }


  async downloadVideoFromS3(bucket: string, key: string, downloadPath: string): Promise<void> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const result = await this.s3Client.send(command);
    const readStream = Readable.from(result.Body as AsyncIterable<Uint8Array>);
    const writeStream = fs.createWriteStream(downloadPath);
    
    return new Promise((resolve, reject) => {
      readStream
        .pipe(writeStream)
        .on('error', reject)
        .on('close', resolve);
    });
  }

  async uploadFramesToS3(frames: string[], bucket: string): Promise<void> {
    for (const framePath of frames) {
      const fileStream = fs.createReadStream(framePath);
      const fileName = path.basename(framePath);
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: fileStream,
        ContentType: 'image/png',
      });
      await this.s3Client.send(command);
    }
  }

  async uploadZipToS3(zipPath: string, bucket: string, zipFileName: string): Promise<void> {
    const fileStream = fs.createReadStream(zipPath);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: zipFileName,
      Body: fileStream,
      ContentType: 'application/zip',
    });
    await this.s3Client.send(command);
  }

  async uploadFile(bucketName: string, key: string, fileBuffer: Buffer, fileMimeType: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: fileMimeType,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Could not upload file: ${error.message}`);
    }
  }

  async getFile(bucketName: string, objectKey: string): Promise<Buffer>  {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      const response = await this.s3Client.send(command);

      /* Convertendo o stream em buffer
      const streamToBuffer = (stream: Readable): Promise<Buffer> => {
        return new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);
        });
      };*/
      const fileBuffer = response.Body ? await streamToBuffer(response.Body as Readable) : Buffer.from([]);
      return fileBuffer

      /* Escrever o buffer em um arquivo no disco
      const filePath = join(downloadPath, objectKey); // define o caminho completo do arquivo
      fs.writeFile(filePath, fileBuffer);
      console.log(filePath); // Retorna o caminho onde o arquivo foi salvo
      
      await this.uploadFile("video-queue", objectKey, fileBuffer, null)*/
      
    } catch (error) {
      console.log(error)
      throw new Error(`Could not download file: ${error.message}`);
    }
    
  }
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};
