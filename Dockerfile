FROM node:18

# Instala o FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


EXPOSE 3000


CMD ["/bin/bash", "-c", "npm run start:dev"]