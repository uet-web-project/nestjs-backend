import * as XLSX from 'xlsx';
import toCamelCase from './toCamelCase';

function xlsxToJson(filePath) {
  const res = [];
  const workbook = XLSX.readFile(filePath);
  const sheetNameList = workbook.SheetNames;
  sheetNameList.forEach((sheetName) => {
    const temp: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    temp.forEach((item) => {
      const tempItem = {};
      Object.keys(item).forEach((key) => {
        tempItem[toCamelCase(key)] = item[key];
      });
      res.push(tempItem);
    });
  });
  // console.log(res);

  return res;
}

export default xlsxToJson;
