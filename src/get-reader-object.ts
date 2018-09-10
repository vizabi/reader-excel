import * as parseDecimal from 'parse-decimal-number';
import { read, utils } from 'xlsx';
import { IReader } from './interfaces';

function getDsvFromJSON(json) {
  const columns = json[0];
  const src = json.slice(1);

  const rows = src.map(record => {
    const newRecord = {};

    for (let i = 0; i < columns.length; i++) {
      newRecord[columns[i]] = record[i];
    }

    return newRecord;
  });

  return { columns, rows };
}

const cached = {};

export const getReaderObject = (fileReader: IReader) => ({
  _name: 'excel',

  init(readerInfo) {
    this._lastModified = readerInfo.lastModified || '';
    this._basePath = readerInfo.path;
    this.keySize = readerInfo.keySize || 1;
    this.assetsPath = readerInfo.assetsPath || '';
    this._parseStrategies = [
      ...[',.', '.,'].map(separator => this._createParseStrategy(separator)),
      numberPar => numberPar,
    ];

    Object.assign(this.ERRORS || {}, {
      WRONG_TIME_COLUMN_OR_UNITS: 'reader/error/wrongTimeUnitsOrColumn',
      NOT_ENOUGH_ROWS_IN_FILE: 'reader/error/notEnoughRows',
      UNDEFINED_DELIMITER: 'reader/error/undefinedDelimiter',
      EMPTY_HEADERS: 'reader/error/emptyHeaders',
      DIFFERENT_SEPARATORS: 'reader/error/differentSeparators',
      FILE_NOT_FOUND: 'reader/error/fileNotFoundOrPermissionsOrEmpty'
    });
  },

  async getAsset(asset) {
    return new Promise((resolve, reject) => {
      resolve();
    });
  },

  getCached() {
    return cached;
  },

  async load() {
    const { _basepath: path, _lastModified } = this;
    const cachedPromise = cached[path + _lastModified];

    return cachedPromise ? cachedPromise : cached[path + _lastModified] = new Promise((resolve, reject) => {
      fileReader.readText(this._basePath, (err, content) => {
        if (err) {
          return reject(err);
        }

        const workbook = read(content, { type: 'binary' });
        const wsName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[wsName];
        const json = utils.sheet_to_json(worksheet, { header: 1 });

        const result = getDsvFromJSON(json);

        resolve(result);
      });
    });
  },

  _createParseStrategy(separators) {
    return value => {
      const hasOnlyNumbersOrSeparators = !(new RegExp(`[^-\\d${separators}]`).test(value));

      if (hasOnlyNumbersOrSeparators && value) {
        const result = parseDecimal(value, separators);

        if (!isFinite(result) || isNaN(result)) {
          this._isParseSuccessful = false;
        }

        return result;
      }

      return value;
    };
  },

  _mapRows(rows, query, parsers) {
    const mapRow = this._getRowMapper(query, parsers);
    this._failedParseStrategies = 0;
    for (const parseStrategy of this._parseStrategies) {
      this._parse = parseStrategy;
      this._isParseSuccessful = true;

      const result = [];
      for (const row of rows) {
        const parsed = mapRow(row);

        if (!this._isParseSuccessful) {
          this._failedParseStrategies++;
          break;
        }

        result.push(parsed);
      }

      if (this._isParseSuccessful) {
        if (this._failedParseStrategies === this._parseStrategies.length - 1) {
          throw this.error(this.ERRORS.DIFFERENT_SEPARATORS);
        }
        return result;
      }
    }
  },

  _onLoadError(error) {
    const { _basepath: path, _lastModified } = this;
    delete cached[path + _lastModified];

    this._super(error);
  }
});
