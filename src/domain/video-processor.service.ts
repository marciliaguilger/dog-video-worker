import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as tmp from 'tmp';
import * as archiver from 'archiver';

@Injectable()
export class VideoService {
 /* async extractFramesToZip(videoPath: string, zipPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputDir = path.dirname(zipPath);
      ffmpeg(videoPath)
        .on('end', async () => {
          const archive = archiver('zip', { zlib: { level: 9 } });
          const output = fs.createWriteStream(zipPath);

          output.on('close', resolve);
          archive.on('error', reject);

          archive.pipe(output);
          fs.readdirSync(outputDir).forEach(file => {
            if (file.startsWith('frame-') && file.endsWith('.png')) {
              archive.file(path.join(outputDir, file), { name: file });
            }
          });
          await archive.finalize();
        })
        .on('error', reject)
        .save(`${outputDir}/frame-%d.png`);
    });
  }*/
  
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