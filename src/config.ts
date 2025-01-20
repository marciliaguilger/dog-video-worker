import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

export const config = {
  VIDEO_QUEUE_NAME: process.env.VIDEO_QUEUE_NAME,
  VIDEO_QUEUE_URL: process.env.VIDEO_QUEUE_URL,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
};