import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoConsumerModule } from './infra/consumer/video-consumer.module';
import { S3Service } from './infra/repository/s3-service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    VideoConsumerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService,S3Service],
  exports: [S3Service],
})
export class AppModule {}
