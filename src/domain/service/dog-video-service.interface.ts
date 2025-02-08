import { UpdateFileDataDto } from "src/domain/dto/update-file-data.dto";

export interface IDogVideoFilesService {
    updateFileData(userId: string, fileId: string, body: UpdateFileDataDto): Promise<any>;
}

export const IDogVideoFilesService = Symbol('IDogVideoFilesService');