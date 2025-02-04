import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as tmp from 'tmp';

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