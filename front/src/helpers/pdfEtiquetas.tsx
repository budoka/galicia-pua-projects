import jsPDF from 'jspdf';
import { createBarcode } from '../utils/barcode';
import autoTable from 'jspdf-autotable';
import { split } from 'lodash';
import moment from 'moment';


const buildEtiquetas = (etiquetas: any[]) => {
    var data: {}[] = [];
    var i = 0;
    var obj = {};
    etiquetas.forEach((e) => {
        Object.defineProperty(obj, i,
            {
                value: e.idDocumento ? (e.idDocumento + "|Id Documento") : (e.idDetalle + "|Id Detalle"),
                writable: true,
                enumerable: true,
                configurable: true
            })
        i++;
        if (i === 4) { // 4 es el numero max. de columnas en el doc.
            data.push(obj);
            obj = {};
            i = 0;
        };
    })
    if (!data.includes(obj)) data.push(obj)
    return data;
};

const buildData = (data: any) => {
    return {
        filename: "Etiquetas",
        idPedido: data.idPedido,
        etiquetas: buildEtiquetas(data.etiquetas)
    }
};

export function createEtiquetasPDF(format: string, data: any) {

    var amountOfPages = 0;
    const doc2 = tableEtiquetas(format, amountOfPages, data)
    amountOfPages = doc2.getCurrentPageInfo().pageNumber;
    const doc = tableEtiquetas(format, amountOfPages, data)

    const filename = `Etiquetas - ${data.idPedido}`;
    doc.save(filename);
};

const tableEtiquetas = (format: string, amountOfPages: number, data: any) => {
    const doc = new jsPDF('landscape', 'px', 'a4', true);
    const scale: number = 1
    doc.context2d.scale(scale, scale);

    const width = doc.internal.pageSize.width;
    const height = doc.internal.pageSize.height;
    const titleFontSize = (width / 50.333) * scale;
    const typeFontSize = (width / 95.333) * scale;
    const lineWidth = 3;
    const marginY = (width / 25) * scale;
    const marginX = (width / 45) * scale;
    const cellWidth = 150;
    const cellHeight = 29;
    var offset = 12;
    var page = 1;

    var cellPosY = 0;
    var cellPosX = 0;

    //const avalaibleHeight = height - 2 * marginX; //  - marginBotton
    const numberOfRows = 13; //const numberOfRows = avalaibleHeight / cellWidth;
    const numberOfColumns = 4;

    const footer = {
        x: width / 2 - 2 * marginY,
        y: height - marginY / 4
    };
    const barcodeSize = {
        width: cellWidth - 10,
        height: cellHeight - 9
    };
    // Ultima posicion permitida en Y antes de la ultima fila 
    const limitY = cellHeight * (numberOfRows - 1) + (marginY + offset);
    // Ultima posicion permitida en X antes de la ultima columna 
    const limitX = cellWidth * (numberOfColumns - 1) + marginX;

    data = buildData(data); // Hacer una funcion que determine el nro. max. de columnas permitidas en el doc.
    autoTable(doc, {
        body: data.etiquetas,
        theme: "grid",
        margin: { left: marginX, top: marginY + offset },
        styles: {
            cellWidth: cellWidth,
            minCellWidth: cellWidth,
            minCellHeight: cellHeight,
        },
        didParseCell: function (HookData) {
            if (HookData.section === 'body' && HookData.cell.raw) HookData.cell.styles.lineWidth = lineWidth; //HookData.cell.styles.lineColor = "black"
            else HookData.cell.styles.lineWidth = 0;
        },
        didDrawCell: function (HookData) {
            if (HookData.section === 'body' && HookData.cell.raw) {
                var sp = split(HookData.cell.raw as string, "|")
                var number = sp[0];
                var type = sp[1]
                var barcodeCodDetalle = createBarcode(format, number.padStart(10, '0'));
                doc.addImage(barcodeCodDetalle.dataURL, 'PNG', HookData.cell.x + 2, HookData.cell.y + 2, barcodeSize.width, barcodeSize.height);
                doc.setFont("normal", "bold");
                doc.setFontSize(typeFontSize);
                doc.text(type, HookData.cell.x + cellWidth / 2.8, HookData.cell.y + barcodeSize.height + 6)
                cellPosY = HookData.cell.y;
                cellPosX = HookData.cell.x;
            }
        },
        didDrawPage: function (HookData) {
            page = doc.getCurrentPageInfo().pageNumber;
            doc.setFontSize(titleFontSize);
            doc.text(`Pedido: ${data.idPedido}`, marginX, marginY);
            var today = moment().format('DD/MM/YYYY');
            doc.text(`${today} Página ${page} de ${amountOfPages}`, footer.x, footer.y)
        },
    })

    const lastRow = cellPosY >= limitY;
    const lastColumn = cellPosX >= limitX;

    const lastCell = lastRow && lastColumn;
    if (lastCell) doc.deletePage(page);

    return doc;
};