export interface IReader {
  readText(filePath: string, onFileRead: Function);
}

export interface IBaseReaderOptions {
  basePath: string;
  fileReader: IReader;
  logger?: any;
}
