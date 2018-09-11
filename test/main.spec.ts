import * as fs from 'fs';
import * as path from 'path';
import * as chai from 'chai';
import { excelReaderObject as excelReaderPlainObject } from '../src/index-backend';

global.d3 = require('d3');
global.Vizabi = require('vizabi');

const expect = chai.expect;

const readJson = (filePath, onFileRead) => {
  if (!fs.existsSync(filePath)) {
    return onFileRead('No such file: ' + filePath);
  }

  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
      onFileRead(err);
      return;
    }

    try {
      onFileRead(null, JSON.parse(content.toString()));
    } catch (e) {
      onFileRead(e);
    }
  });
};

describe('excel reader object', () => {
  it('load data', async () => {
    const expectedResult = require('./results/main.json');
    const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
    const excelReaderObject = new ExcelReader({
      path: path.resolve('test/fixtures/basic-2003.xls')
    });
    const result = await excelReaderObject.load();

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
