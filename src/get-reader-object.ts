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
  MISSED_INDICATOR_NAME: 'indicator',
  _name: 'excel',

  init(readerInfo) {
    this.lastModified = readerInfo.lastModified || '';
    this.path = readerInfo.path;
    this.sheet = readerInfo.sheet || 0;
    this.keySize = readerInfo.keySize || 1;
    this.assetsPath = readerInfo.assetsPath || '';
    this.isTimeInColumns = readerInfo.timeInColumns || false;
    this.timeKey = 'time';
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
      REPEATED_KEYS: 'reader/error/repeatedKeys',
      WRONG_SHEET: 'reader/error/wrongSheet'
    });
  },

  getAsset: csvReaderObject.getAsset,

  getCached() {
    return cached;
  },

  async load(parsers) {
    const cacheKey = this.path + this.lastModified;
    const cachedPromise = cached[cacheKey];

    return cachedPromise ? cachedPromise : cached[cacheKey] = new Promise((resolve, reject) => {
      fileReader.readText(this.path, (err, content) => {
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
        const transformer = this.isTimeInColumns ? csvReaderObject.timeInColumns.bind(this) : r => r;
        const result = transformer(getDsvFromJSON(json), parsers);

        resolve(result);
      });
    });
  },

  _createParseStrategy: csvReaderObject._createParseStrategy,

  _mapRows: csvReaderObject._mapRows,

  _onLoadError: csvReaderObject._onLoadError
});
