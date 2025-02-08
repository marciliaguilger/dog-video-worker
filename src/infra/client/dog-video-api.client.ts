import { HttpService } from "@nestjs/axios";
import { AxiosError } from 'axios';
import { HttpException, Injectable } from "@nestjs/common";
import { catchError, firstValueFrom } from "rxjs";
import { IDogVideoFilesService } from "src/domain/service/dog-video-service.interface";
import { UpdateFileDataDto } from "../../domain/dto/update-file-data.dto";

@Injectable()
export class DogVideoApiClient implements IDogVideoFilesService {
  constructor(private readonly httpService: HttpService) {}
    async updateFileData(userId: string, fileId: string, body: UpdateFileDataDto): Promise<any> {
        const url = `/users/${userId}/files/${fileId}`;
        try{
            const { data } = await firstValueFrom(
                this.httpService.patch<any>(url, body).pipe(
                catchError((error: AxiosError) => {
                    console.log(error)
                    throw new HttpException(error.response.data, error.response.status);
                }),
                ),
            );
            return data;
        }catch(err){
            console.log(err)
            return undefined;
        }
    }

    async updateFileStatus(userId: string, fileId: string, body: UpdateFileDataDto): Promise<any> {
        const url = `/users/${userId}/files/${fileId}`;
        try{
            const { data } = await firstValueFrom(
                this.httpService.patch<any>(url, body).pipe(
                catchError((error: AxiosError) => {
                    console.log(error)
                    throw new HttpException(error.response.data, error.response.status);
                }),
                ),
            );
            return data;
        }catch(err){
            console.log(err)
            return undefined;
        }
    }
}