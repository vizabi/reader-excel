import * as path from 'path';
import * as chai from 'chai';
import { excelReaderObject as excelReaderPlainObject } from '../src/index-backend';

global.d3 = require('d3');
global.Vizabi = require('vizabi');

const expect = chai.expect;

describe('excel reader object', () => {
  it('load data', async () => {
    const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
    const excelReaderObject = new ExcelReader({
      path: path.resolve('test/fixtures/basic-2003.xls')
    });
    const res = await excelReaderObject.load();

    expect(res.columns).to.deep.equal([ 'geo', 'time', 'GDP', 'LEX', 'POP', 'world_region', 'category' ]);
    expect(res.rows.length).to.equal(6600);
  });
});
