import { read, utils } from 'xlsx';
import { csvReaderObject } from 'vizabi-csv-reader';
import { IReader } from './interfaces';

declare const d3;
declare const Vizabi;

function getDsvFromJSON(json) {
  const columns = json[0];
  const src = json.slice(1);

  const rows = src.map(record => {
    const newRecord = {};

    for (let i = 0; i < columns.length; i++) {
      newRecord[columns[i]] = record[i] || '';
    }

    return newRecord;
  });

  return { columns, rows };
}

let cached = {};

export const clearCache = () => cached = {};

export const getReaderObject = (fileReader: IReader) => ({
  _name: 'excel',

  init(readerInfo) {
    this._lastModified = readerInfo.lastModified || '';
    this._basePath = readerInfo.path;
    this.sheet = readerInfo.sheet || 0;
    this.keySize = readerInfo.keySize || 1;
    this.assetsPath = readerInfo.assetsPath || '';
    this._parseStrategies = [
      ...[',.', '.,'].map(separator => this._createParseStrategy(separator)),
      numberPar => numberPar,
    ];
    this.additionalTextReader = readerInfo.additionalTextReader;
    this.additionalJsonReader = readerInfo.additionalJsonReader;

    Object.assign(this.ERRORS || {}, {
      WRONG_TIME_COLUMN_OR_UNITS: 'reader/error/wrongTimeUnitsOrColumn',
      NOT_ENOUGH_ROWS_IN_FILE: 'reader/error/notEnoughRows',
      UNDEFINED_DELIMITER: 'reader/error/undefinedDelimiter',
      EMPTY_HEADERS: 'reader/error/emptyHeaders',
      DIFFERENT_SEPARATORS: 'reader/error/differentSeparators',
      FILE_NOT_FOUND: 'reader/error/fileNotFoundOrPermissionsOrEmpty',
      WRONG_SHEET: 'reader/error/wrongSheet'
    });
  },

  getAsset: csvReaderObject.getAsset,

  getCached() {
    return cached;
  },

  async load() {
    const cacheKey = this.basePathpat + this._lastModified;
    const cachedPromise = cached[cacheKey];

    return cachedPromise ? cachedPromise : cached[cacheKey] = new Promise((resolve, reject) => {
      fileReader.readText(this._basePath, (err, content) => {
        if (err) {
          return reject(err);
        }

        const workbook = read(content, { type: 'binary' });
        const getWorkSheetName = () => {
          if (Number.isInteger(this.sheet) && this.sheet < workbook.SheetNames.length && this.sheet >= 0) {
            return workbook.SheetNames[this.sheet];
          } else if (workbook.Sheets[this.sheet]) {
            return this.sheet;
          } else {
            throw this.error(this.ERRORS.WRONG_SHEET);
          }
        };

        const wsName = getWorkSheetName();
        const worksheet = workbook.Sheets[wsName];
        const json = utils.sheet_to_json(worksheet, { header: 1 });

        const result = getDsvFromJSON(json);

        resolve(result);
      });
    });
  },

  _createParseStrategy: csvReaderObject._createParseStrategy,

  _mapRows: csvReaderObject._mapRows,

  _onLoadError: csvReaderObject._onLoadError
});
