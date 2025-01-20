import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoConsumerModule } from './infra/consumer/video-consumer.module';

@Module({
  imports: [
    VideoConsumerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
