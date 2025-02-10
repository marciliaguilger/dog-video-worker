import { Inject, Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { IDogVideoApiClient } from "./service/dog-video-service.interface";
import { UpdateFileDataDto } from "./dto/update-file-data.dto";

@Injectable()
export class VideoService {
  async extractFrames(videoPath: string, outputDir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const frameFiles: string[] = [];
      ffmpeg(videoPath)
        .on('end', () => {
          fs.readdirSync(outputDir).forEach(file => {
            if (file.startsWith('frame-') && file.endsWith('.png')) {
              frameFiles.push(path.join(outputDir, file));
            }
          });
          resolve(frameFiles);
        })
        .on('error', (err) => reject(err))
        .save(`${outputDir}/frame-%d.png`);
    });
  }
}