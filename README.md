# Vizabi Excel reader

The main goal of this repo is to provide ability for Vizabi to work with XLS and XLSX data.

## Install

```
npm i vizabi-excel-reader
```

## Usage

### Usage on backend

```javascript
import * as path from 'path';
import { excelReaderObject as excelReaderPlainObject } from 'vizabi-excel-reader';

global.d3 = require('d3');
global.Vizabi = require('vizabi');

const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
const excelReaderObject = new ExcelReader({
  path: path.resolve('path to XLS file'),
  sheet: 'basic'
});
const result = await excelReaderObject.load();

console.log(result);
```

### Usage on frontend

```html
<script src="node_modules/vizabi-excel-reader/dist/vizabi-excel-reader.js"></script>
<script>
  // ExcelReader global variable was imported by script above
  Vizabi.Reader.extend("excel-reader", ExcelReader.excelReaderObject);
  // use "excel-reader" as a Vizabi init parameter
  // .....
</script>
```

### Get assets on backend

```javascript
import * as fs from 'fs';
import { excelReaderObject as excelReaderPlainObject } from 'vizabi-excel-reader';

global.d3 = require('d3');
global.Vizabi = require('vizabi');

const readJson = (filePath, onFileRead) => {
  fs.stat(filePath, (fileErr, stat) => {
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

const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
const excelReaderObject = new ExcelReader({
  assetsPath: 'path to assets', // must be ended with '/'
  additionalJsonReader: readJson
});
const result = await excelReaderObject.getAsset('asset file name');

console.log(result);
```

### Get worksheets names
```javascript
import * as path from 'path';
import { excelReaderObject as excelReaderPlainObject } from 'vizabi-excel-reader';

global.d3 = require('d3');
global.Vizabi = require('vizabi');

const ExcelReader = global.Vizabi.Reader.extend(excelReaderPlainObject);
const excelReaderObject = new ExcelReader({
  path: path.resolve('path to XLS file'),
  sheet: 'basic'
});

const result = await excelReaderObject.getWorksheets();

console.log(result);
```

### Initial parameters

* `path` - path to XLS file that would be processed
* `timeInColumns` - a flag that indicates that Excel file contains data in `time-in-columns` format (false by default)
* `sheet`- XLS sheet to open, can be a number or a string. In case of number it should be
           an order number of the expected sheet, in case of string it should be a name of 
           the expected sheet (0 is default)
* `lastModified` - last modification date (optional)
* `keySize` - key size (1 by default)
* `hasNameColumn` - an extra column that contains country name (should not be processed, optional, false by default)
* `nameColumnIndex` - index of `nameColumn` (default value is 0)
* `assetsPath` - path to assets JSON file (optional, must be ended with '/')
* `additionalTextReader` - function that should replace tenured text reading function 
                           (optional, see examples above, could be useful on frontend or testing) 
* `additionalJsonReader` - function that should replace tenured JSON reading function
                           (optional, see examples above, could be useful on frontend or testing)

### Run tests

```
npm test
```

## Build

```
git clone https://github.com/vizabi/vizabi-excel-reader.git
cd vizabi-excel-reader
npm i
npm run build
```

The result is a couple of directories: `dist` and `lib`.

`dist` contain two files: `vizabi-excel-reader.js` and `vizabi-excel-reader.js.map`. These files could be used
on frontend: see `Usage on frontend`

`lib` (`lib/index.js`) - is used 'by default' (see `main` section of `package.json`) and could be used on
backend (see `Usage on backend`)
