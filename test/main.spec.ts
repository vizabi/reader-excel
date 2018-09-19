import * as fs from 'fs';
import * as path from 'path';
import * as chai from 'chai';
import { excelReaderObject as excelReaderPlainObject, clearCache } from '../src/index-backend';

global.d3 = require('d3');
global.Vizabi = require('vizabi');

const expect = chai.expect;

const readJson = (filePath, onFileRead) => {
  fs.stat(filePath, (fileErr, stat: any) => {
    if (fileErr) {
      return onFileRead(fileErr);
    }

    if (stat.code === 'ENOENT') {
      return onFileRead('No such file: ' + filePath);
    }

    fs.readFile(filePath, 'utf-8', (readErr, content) => {
      if (readErr) {
        return onFileRead(readErr);
      }

      try {
        onFileRead(null, JSON.parse(content.toString()));
      } catch (e) {
        onFileRead(e);
      }
    });
  });
};

describe('excel reader object', () => {
  beforeEach(clearCache);

  const files = ['basic-2003.xls', 'basic-2013.xlsx'];

  for (const file of files) {
    it(`load ${file} data from default sheet`, async () => {
      const expectedResult = require('./results/main.json');
      const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
      const excelReaderObject = new ExcelReader({
        path: path.resolve(`test/fixtures/${file}`)
      });
      const result = await excelReaderObject.load();

      expect(result).to.deep.equal(expectedResult);
    });

    it(`load ${file} data from a sheet as a number`, async () => {
      const expectedResult = require('./results/main.json');
      const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
      const excelReaderObject = new ExcelReader({
        path: path.resolve(`test/fixtures/${file}`),
        sheet: 0
      });
      const result = await excelReaderObject.load();

      expect(result).to.deep.equal(expectedResult);
    });

    it(`load ${file} data from a sheet as a string`, async () => {
      const expectedResult = require('./results/main.json');
      const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
      const excelReaderObject = new ExcelReader({
        path: path.resolve(`test/fixtures/${file}`),
        sheet: 'basic'
      });
      const result = await excelReaderObject.load();

      expect(result).to.deep.equal(expectedResult);
    });

    it(`load ${file} data from a sheet as a string`, async () => {
      const expectedResult = require('./results/secondary.json');
      const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
      const excelReaderObject = new ExcelReader({
        path: path.resolve(`test/fixtures/${file}`),
        sheet: 'secondary'
      });
      const result = await excelReaderObject.load();

      expect(result).to.deep.equal(expectedResult);
    });

    it(`load ${file} data from a sheet as a number`, async () => {
      const expectedResult = require('./results/secondary.json');
      const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
      const excelReaderObject = new ExcelReader({
        path: path.resolve(`test/fixtures/${file}`),
        sheet: 1
      });
      const result = await excelReaderObject.load();

      expect(result).to.deep.equal(expectedResult);
    });
  }

  for (const file of files) {
    it(`get worksheets names from ${file}`, async () => {
      const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
      const excelReaderObject = new ExcelReader({
        path: path.resolve(`test/fixtures/${file}`)
      });
      const result = await excelReaderObject.getWorksheets();

      expect(result).to.deep.equal(['basic', 'secondary']);
    });
  }

  it('load data with time in columns format', async () => {
    const expectedResult = require('./results/timeright--education.json');
    const CsvReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
    const csvReaderObject = new CsvReader({
      path: path.resolve('test/fixtures/timeright--education.xlsx'),
      timeInColumns: true
    });
    const result = await csvReaderObject.load();

    expect(result).to.deep.equal(expectedResult);
  });

  it('load assets', async () => {
    const expectedResult = require('./fixtures/world-50m.json');
    const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
    const excelReaderObject = new ExcelReader({
      assetsPath: path.resolve('test/fixtures/') + '/',
      additionalJsonReader: readJson
    });
    const result = await excelReaderObject.getAsset('world-50m.json');

    expect(result).to.deep.equal(expectedResult);
  });
});
