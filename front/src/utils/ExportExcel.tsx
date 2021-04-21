import FileSaver from 'file-saver';
import { WriteFileOptions } from 'fs';
import { ObjectLiteralElement } from 'typescript';
import * as XLSX from 'xlsx';
import { BoxDetailTemplate, BoxDocumentColumnTemplate, BoxDocumentTemplate, BoxLabelTemplate, BoxTemplate } from '../types/caja-templates';
import { getCurrentDate, isDateBetween } from './Common';
import ExcelJS, { Cell, DataValidation } from 'exceljs';
import { guardarContenido2 } from '../API/ContenidoAPI';
import { BoxDetailAPIRequest, BoxDetailColumnAPIRequest, BoxDocumentAPIRequest } from '../types/caja-datos';
import _, { forEach, isNumber } from 'lodash';
import { TipoCaja } from '../types/TipoCaja';
import Dayjs from 'dayjs';
import { HttpException } from '../API/CajaAPI';
import moment from 'moment';
import { formatDate as format } from '../utils/Common';
import { store } from 'src/store';

const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const fileExtension = '.xlsx';

const transformDate = (obj: any): any => {
  obj.fechaEmision = getCurrentDate(obj.fechaEmision);
  return obj;
};

export const exportToCSV = (fileName: string, json: Array<any>) => {
  const ws = XLSX.utils.json_to_sheet(json.map((obj) => transformDate(obj)));
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};

// get maximum character of each column
function wscols(json: any[]) {
  return Object.keys(json[0]).map((key) => {
    var max = Math.max(...json.map((row) => (row[key] ? row[key].toString().length : 0)));
    if (key.length > max) return { wch: key.length };
    else return { wch: max };
  });
}

export const exportToCSV2 = (fileName: string, json: Array<any>) => {
  const ws = XLSX.utils.json_to_sheet(json.filter((j) => delete j.key));
  if (json.length > 0) ws['!cols'] = wscols(json);
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};

export const exportToCSV4 = (fileName: string, domTable: string) => {
  const table = document.getElementById(domTable)!.cloneNode(true) as HTMLTableElement;
  const rows = table.rows;

  for (var i = 0; i < rows[0].cells.length; i++) {
    var str = rows[0].cells[i].innerText;
    if (str.search(/Eliminar/) != -1) {
      for (var j = 0; j < rows.length; j++) {
        rows[j].deleteCell(i);
        rows[j].deleteCell(i);
      }
    }
  }

  const ws = XLSX.utils.table_to_sheet(table);
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};

const removeStringPrefix = (str: string, prefix: string, ignoreCase: boolean = true): string => {
  const hasPrefix = ignoreCase ? str.toLowerCase().startsWith(prefix.toLowerCase()) : str.startsWith(prefix);
  if (!hasPrefix) return str;
  else return str.slice(prefix.length);
};

const splitStringUppercase = (str: string): string => {
  const matches = str.match(/([A-Z]?[^A-Z]*)/g);

  if (!matches) return str;
  else return matches.slice(0, -1).join(' ');
};

type DataType = 'texto' | 'entero' | 'fecha' | undefined;
type DataRequired = 'R' | 'N' | 1 | 0 | undefined;
type ContentType = 'Caja con Documentos' | 'Caja con Detalle' | undefined;
const COLUMN_NAME_DOCUMENT_TYPE = 'Tipo Documental';

// colNumber > columnLength
/*
const calculateAllColumnsNames = (columnLength : number) => {
  //let columnName = sheet.getCell(1, colNumber).value?.toString()!;
  var columnsNmaes = [];
  var n = 0;
  while (n <= columnLength) {
    n ++;
   columnsNmaes.push(sheet.getCell(1, n).value?.toString()!);
  }
}
*/

export const getValuesFromColumn = async (file: File, column: string | number) => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  const data = new Set<string>();

  sheet.eachRow((row, index) => {
    const value = String(row.getCell(column).value);
    if (value) data.add(value);
  });

  return data;
};

export const excelToDatabase = async (file: File, preview: BoxTemplate, boxId: number) => {
  // Se pasa el archivo a un buffer y se carga el excel del buffer
  const buffer = await file.arrayBuffer(); // file es null
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];

  let contentType: ContentType;
  let content: BoxDocumentAPIRequest[] | BoxDetailAPIRequest[] = [];

  // Validación de plantilla
  const headerExcel = (sheet.getRow(1).values as string[]).join('').split(' ').join(''); //(sheet.getRow(1).values as string[]).join('').replaceAll(/\s/g, '');
  let headerPreview = null;

  if ((preview as BoxDocumentTemplate[])[0].inclusions) {
    headerPreview = (
      COLUMN_NAME_DOCUMENT_TYPE +
      (preview as BoxDocumentTemplate[])[0].inclusions
        .map((c) => c.title)
        .join('')
        .split('Inclusion').join('')//.replaceAll('Inclusion', '')
    ).split(' ').join(''); //.replaceAll(/\s/g, '');

    contentType = 'Caja con Documentos';
  } else if ((preview as BoxDetailTemplate[])[0].templateId) {
    headerPreview = (preview as BoxDetailTemplate[])
      .map((c) => c.title)
      .join('')
      .split(' ').join('');//.replaceAll(/\s/g, '');

    contentType = 'Caja con Detalle';
  }

  if (!contentType || headerExcel !== headerPreview) {
    throw new Error('Plantilla no válida.');
  }
  // End - Validación de plantilla

  const minDate = Dayjs(new Date(1910, 1, 1));
  const maxDate = Dayjs(new Date(2999, 12, 31));
  const textPattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ0-9.,:\s]*$/;

  sheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
    let dataRow: any = {};
    let columns: BoxDetailColumnAPIRequest[] = [];

    // Elimino el valor de la celda Z (agregado en la preview para agregar las "pre-validaciones" en el Excel)
    const values = (row.values as ExcelJS.CellValue[]).slice(0, -1);
    // Si todas las celdas están vacías, la fila está vacía y se ignora.
    const isRowEmpty = values.every((v) => v === null);
    // Si la fila no es el Header/Titulo y no está vacía, entonces se debe procesar.
    const shouldProcessRow = rowNumber > 1 && !isRowEmpty;

    let fechaDesde: string;

    // Se procesa la fila
    if (shouldProcessRow) {
      row.eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell, colNumber: number) => {
        // Obtengo el Header/titulo de la columna, si no tiene continúo a la siguiente celda.
        let columnName = sheet.getCell(1, colNumber).value?.toString()!;
        if (!columnName) return;

        // Obtengo el valor de la celda en string.
        let value = sheet.getCell(rowNumber, colNumber).value?.toString() ?? '';

        // Se aplica la lógica correspondiente según el tipo de contenido (Documento o Detalle).
        if (contentType === 'Caja con Documentos') {
          // DOCUMENTO
          // Para el tipo documental, su valor es el id.
          columnName = _.camelCase(columnName);
          if (columnName === 'tipoDocumental') {
            columnName = 'idTipoDocumento';

            value = String((preview as BoxDocumentTemplate[]).find((p) => p.description === value)?.id);
            // Si la columna es una fecha (en base al título), se la parsea al formato YYYY-MM-DD.
          } else if (columnName.toLowerCase().startsWith('fecha')) {
            let minDateFixed = minDate;
            if (columnName.toLowerCase() === 'fechahasta' && fechaDesde) minDateFixed = Dayjs(fechaDesde, 'YYYY-MM-DD');

            const isValidDate = isDateBetween(minDateFixed, maxDate, value);

            if (!isValidDate) throw new Error(`La fecha en la celda ${cell.address} no es válida`);
            value = formatDate(value, 'YYYY-MM-DD');
            if (columnName.toLowerCase() === 'fechadesde') fechaDesde = value;
          } else {
            if (columnName === 'sucCCPropietario') {
              // Si existe siempre es obligatorio
              columnName = 'idSectorPropietario';
            }
          }
          // Se guarda el valor en un objeto fila.
          dataRow[columnName] = value;
        } else if (contentType === 'Caja con Detalle') {
          // DETALLE
          // Se obtiene el id de la columna y el tipo de dato.
          const columnId = (preview as BoxDetailTemplate[]).find((p) => p.title === columnName)?.id!;
          const columnDataType = (preview as BoxDetailTemplate[]).find((p) => p.title === columnName)?.dataType!;
          // Si la columna es una fecha (en base al tipo de dato), se la parsea al formato YYYY-MM-DD.
          if (columnDataType.toLowerCase() === 'fecha') {
            let minDateFixed = minDate;
            if (columnName.toLowerCase() === 'fechahasta' && fechaDesde) minDateFixed = Dayjs(fechaDesde, 'YYYY-MM-DD');

            const isValidDate = isDateBetween(minDateFixed, maxDate, value);

            if (!isValidDate) throw new Error(`La fecha en la celda ${cell.address} no es válida`);
            value = formatDate(value, 'YYYY-MM-DD');
            if (columnName.toLowerCase() === 'fechadesde') fechaDesde = value;
          }
          // Se guarda el valor en un objeto dentro de un array.
          columns = [...columns, { valor: value, idColumna: columnId }];
        }

        const arrRowKey = Object.keys(dataRow);

        if (contentType === 'Caja con Documentos') {
          const inclusions = (preview as BoxDocumentTemplate[]).find((p) => p.id === +dataRow['idTipoDocumento'])?.inclusions;

          if (!inclusions) throw new Error(`Se encontró un documento no válido o sin completar en la celda ${cell.address}`);

          if (arrRowKey.length > 1) {
            const inclusion = inclusions[colNumber - 2];

            const isValidDate = inclusion && inclusion.dataType === 'fecha' && inclusion.required === 'R' ? moment(value).isValid() : true;
            const isValidInteger =
              inclusion && inclusion.dataType === 'entero' && inclusion.required === 'R' ? !isNaN(parseInt(value)) : true;
            const isValidText = inclusion.dataType === 'texto' ? textPattern.test(value) : true;
            const isRequiredAndValid = inclusion && inclusion.required === 'R' ? value.trim().length > 0 : true;

            if (!isValidDate || !isValidInteger || !isRequiredAndValid || !isValidText) {
              throw new Error(`Se encontró un campo no válido o requerido sin completar en la celda ${cell.address}`);
            }
          }
        } else if (contentType === 'Caja con Detalle') {
          const column = (preview as BoxDetailTemplate[]).find((p) => p.title === columnName);
          const required = column?.required;
          const dataType = column?.dataType;

          const isValidDate = dataType === 'fecha' && required === 1 ? moment(value).isValid() : true;
          const isValidInteger = dataType === 'entero' && required === 1 ? !isNaN(parseInt(value)) : true;
          const isValidText = dataType === 'texto' ? textPattern.test(value) : true;
          const isRequiredAndValid = required === 1 ? value.trim().length > 0 : true;

          if (!isValidDate || !isValidInteger || !isRequiredAndValid || !isValidText) {
            throw new Error(`Se encontró un campo no válido o requerido sin completar en la celda ${cell.address}`);
          }
        }
      });
    }

    if (contentType === 'Caja con Documentos' && _.isEmpty(dataRow)) return;
    else if (contentType === 'Caja con Detalle' && _.isEmpty(columns)) return;

    dataRow['idCaja'] = boxId;
    dataRow['idUsuarioAlta'] = store.getState().sesion.data.idUsuario; // solo para documento
    dataRow['idSectorOrigen'] = store.getState().sesion.data.idSector; // solo para documento
    dataRow['idSectorTenedor'] = store.getState().sesion.data.idSector; // solo para documento
    dataRow['idPlantilla'] = (preview as BoxDetailTemplate[])[0].templateId; // solo para detalle
    dataRow['columnas'] = columns; // Agregar metodo que revisa si faltan agregar columnas, y si faltan es porque el Excel en esa columna esta vacia, en ese caso poner valores null acorde
    content = [...content, dataRow];
  });

  function formatDate(value: string, format: string) {
    return value && Dayjs(value).add(1, 'day').set('hour', 0).format(format);
  }

  if (_.isEmpty(content)) {
    throw new Error('No hay datos para importar.');
  }

  return await guardarContenido2(contentType, content);
};

export const previewToExcel = async (filename: string, preview: BoxTemplate) => {
  if (!preview || preview.length === 0) return;

  // Excel
  const workbook = new ExcelJS.Workbook();
  // Hojas
  const previewSheet = workbook.addWorksheet('Template Carga Documentos', {
    properties: { defaultColWidth: 90 },
  });
  let documentSheet = workbook.addWorksheet('TipoDocumentoPermitido', {
    properties: { defaultColWidth: 90 },
  });

  /*
  let infoSheet = workbook.addWorksheet('Info', {
    properties: { defaultColWidth: 90 },
  });*/

  // Columnas
  let columns: (Pick<BoxDocumentColumnTemplate, 'title'> | BoxDocumentColumnTemplate | BoxDetailTemplate)[] = [];
  // Lista de documentos (para caja con documentos)
  let availableDocuments: string[] = [];

  // Mapeo de columnas y lista de documentos
  if ((preview[0] as BoxDocumentTemplate).inclusions) {
    const documentPreview = preview as BoxDocumentTemplate[];
    availableDocuments = documentPreview.map((doc) => doc.description);

    const inclusions = documentPreview.map((doc) => doc.inclusions);
    columns = inclusions[0].map((c) => {
      return { ...c, title: splitStringUppercase(removeStringPrefix(c.title, 'Inclusion')) };
    });
    columns = [{ title: COLUMN_NAME_DOCUMENT_TYPE }, ...columns];
  } else if ((preview[0] as BoxDetailTemplate).templateId) {
    const detailPreview = preview as BoxDetailTemplate[];
    columns = detailPreview.map((c) => c);
  } else {
    return;
  }

  // Estilo del header
  previewSheet.getRow(1).font = {
    bold: true,
  };
  previewSheet.getRow(1).alignment = { horizontal: 'center' };
  // previewSheet.getRow(1).border = { bottom: { color: { argb: '000000' }, style: 'thick' } };

  // Workaround para iterar las celdas (eachCell)
  const maxRows = 999;
  const values = Array(maxRows).fill('');
  previewSheet.getColumn('Z').values = values;
  previewSheet.getColumn('Z').hidden = true;

  // Asignar valores del header (titulos de columnas)
  previewSheet.columns = columns.map((column) => {
    return {
      header: column.title,
      key: column.title,
      width: 20,
    };
  });

  // Iteracion de columnas para definir formatos y validaciones
  previewSheet.columns.forEach((column, index) => {
    const { dataType } = columns[index] as BoxDocumentColumnTemplate | BoxDetailTemplate;
    const { length } = columns[index] as BoxDetailTemplate;

    let type: DataValidation['type'];
    let formulae: DataValidation['formulae'];
    let operator: DataValidation['operator'];
    let allowBlank: DataValidation['allowBlank'];
    let showErrorMessage: DataValidation['showErrorMessage'];
    let error: DataValidation['error'];
    let numFmt: string;

    switch (dataType as DataType) {
      case undefined: {
        type = 'list';
        formulae = ['=TipoDocumentoPermitido!$A$1:$A$100'];
        error = 'El valor del campo debe ser elegido de la lista.';
        break;
      }
      case 'texto': {
        type = 'textLength';
        formulae = [length ?? ''];
        operator = length ? 'lessThanOrEqual' : undefined;
        error = `El valor del campo debe ser alfanumérico. Longitud máxima del campo: ${length ?? 'Sin máximo'}.`;
        break;
      }
      case 'entero': {
        type = 'whole';
        error = `El valor del campo debe ser un número entero. Longitud máxima del campo: ${length ?? 'Sin máximo'}.`;
        numFmt = '0';
        break;
      }
      case 'fecha': {
        type = 'date';
        error = `El valor del campo debe ser una fecha. Formato: DD/MM/AAAA.`;
        numFmt = 'dd/mm/yyyy';
        //  operator = 'greaterThanOrEqual';
        //  showErrorMessage = true;
        // formulae = [new Date(1901, 0, 1)];
        break;
      }
      default:
        break;
    }

    column.eachCell!({ includeEmpty: true }, (cell: Cell, rowNumber: number) => {
      if (rowNumber > 1) {
        cell.numFmt = numFmt;
        cell.dataValidation = {
          type,
          formulae,
          operator,
          allowBlank: false,
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Campo no válido',
          error,
        };
      }
    });
  });

  // Hoja de tipos de doumentos
  const documentTypeRows = availableDocuments.map((documentType) => {
    return [documentType];
  });

  documentSheet.addRows(documentTypeRows);
  documentSheet.state = 'hidden';

  // Hoja de información adicional (para facilitar la importación)
  //infoSheet.addRows(documentTypeRows);
  // infoSheet.state = 'hidden';

  // Generar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
};
