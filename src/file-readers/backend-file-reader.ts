import * as fs from 'fs';
import { IReader } from '../interfaces';

export class BackendFileReader implements IReader {
  readText(filePath: string, onFileRead: Function) {
    if (!fs.existsSync(filePath)) {
      return onFileRead('No such file: ' + filePath);
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        return onFileRead(err);
      }

      onFileRead(null, content.toString('binary'));
    });
  }
}
