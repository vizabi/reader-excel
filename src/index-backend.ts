import { BackendFileReader } from './file-readers/backend-file-reader';
import { getReaderObject } from './get-reader-object';

export const excelReaderObject = getReaderObject(new BackendFileReader());
