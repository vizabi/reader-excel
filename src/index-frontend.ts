import { FrontendFileReader } from './file-readers/frontend-file-reader';
import { getReaderObject } from './get-reader-object';

export const excelReaderObject = getReaderObject(new FrontendFileReader());
