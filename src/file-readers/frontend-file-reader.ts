import { IReader } from '../interfaces';

require('fetch-polyfill');

declare const fetch;

export class FrontendFileReader implements IReader {
  readText(filePath: string, onFileRead: Function) {
    fetch(filePath)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();

        reader.onloadend = function () {
          onFileRead(null, reader.result);
        }

        reader.readAsBinaryString(blob);
      })
      .catch(err => {
        onFileRead(`${filePath} read error: ${err}`);
      });
  }
}
