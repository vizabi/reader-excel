import { read, utils } from 'xlsx';
import { IReader } from './interfaces';

const ERRORS = {
  WRONG_SHEET: 'reader/error/wrongSheet'
};

let cached = {};

export const clearCache = () => cached = {};

export const getReaderObject = (fileReader: IReader) => (csvReader) => ({
  _name: 'excel',

  init(readerInfo) {
    this._lastModified = readerInfo.lastModified || '';
    this._basepath = readerInfo.path;
    this.sheet = readerInfo.sheet || 0;

    Object.assign(this, csvReader(Object.assign({
      externalTextReader: this.xslToCsvReader.bind(this)
    }, readerInfo)))
  },

  getCached() {
    return cached;
  },

  async getWorksheets() {
    const cacheKey = `worksheets${this._name}${this._basepath}${this._lastModified}`;
    const cachedPromise = cached[cacheKey];

    return cachedPromise ? cachedPromise : cached[cacheKey] = new Promise((resolve, reject) => {
      fileReader.readText(this._basepath, (err, content) => {
        if (err) {
          return reject(err);
        }

        const workbook = read(content, {type: 'binary'});

        resolve(workbook.SheetNames);
      });
    });
  },

  async xslToCsvReader() {
    const cacheKey = `${this._name}${this._basepath}${this._lastModified}#${this.sheet}`;
    const cachedPromise = cached[cacheKey];

    return cachedPromise ? cachedPromise : cached[cacheKey] = new Promise((resolve, reject) => {
      fileReader.readText(this._basepath, (err, content) => {
        if (err) {
          return reject(err);
        }

        const workbook = read(content, {type: 'binary'});
        const getWorkSheetName = () => {
          if (Number.isInteger(this.sheet) && this.sheet < workbook.SheetNames.length && this.sheet >= 0) {
            return workbook.SheetNames[this.sheet];
          } else if (workbook.Sheets[this.sheet]) {
            return this.sheet;
          } else {
            throw this.error(ERRORS.WRONG_SHEET);
          }
        };

        const wsName = getWorkSheetName();
        const worksheet = workbook.Sheets[wsName];

        resolve(utils.sheet_to_csv(worksheet));
      });
    });
  },

});
