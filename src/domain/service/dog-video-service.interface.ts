import { UpdateFileDataDto } from "src/domain/dto/update-file-data.dto";

export interface IDogVideoApiClient {
    updateFileStatus(fileId: string, body: UpdateFileDataDto): Promise<any>;
}

export const IDogVideoApiClient = Symbol('IDogVideoApiClient');