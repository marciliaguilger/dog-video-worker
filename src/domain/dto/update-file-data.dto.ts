export class UpdateFileDataDto{
    public status: string;
    public fileKey: string;

    constructor(status: string, fileKey: string) {
      this.status = status;
      this.fileKey = fileKey;
    }
  }