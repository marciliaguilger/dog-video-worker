export class UpdateFileDataDto{
    public status: string;
    public path: string;

    constructor(status: string, fileKey: string) {
      this.status = status;
      this.path = fileKey;
    }
  }