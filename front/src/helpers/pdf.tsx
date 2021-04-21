import jsPDF from 'jspdf';
import autoTable, { ColumnInput } from 'jspdf-autotable';
import { createBarcode } from '../utils/barcode';


export interface IPDFData {
  destino: string;
  sector: string;
  centroDeCostos: string;
  numeroDeCaja: string;
  descripcion: string;
  filename: string;
}

export interface Ruta {
  codigoDetallePedido: string,
  caja: string,
  documento: string,
  tipoPedido: string,
  resolucion: string,
  observaciones: string,
};

export interface IPDFHojaRutaData {
  hojaRutaNro: string;
  tipo: string;
  pedidoNro: string;
  usuarioSolicitante: string;
  enviarA: string;
  deposito: string;
  fecha: string;
  descripcion: string;
  fechaPedidoUrgente?: string;
  filename: string;
  rutas: any[];
};

export function createHojaRutaPDF(format: string, data: IPDFHojaRutaData) {

  const doc = new jsPDF('landscape', 'px', 'a4', true);
  const doc2 = new jsPDF('landscape', 'px', 'a4', true);

  const barcode = createBarcode(format, data.pedidoNro.padStart(10, '0'));

  const columns: ColumnInput[] = [{ header: 'Código Detalle Pedido', dataKey: 'codigoDetallePedido' }, { header: 'Caja', dataKey: 'caja' }, { header: 'Documento', dataKey: 'documento' },
  { header: 'Tipo de Pedido', dataKey: 'tipoPedido' }, { header: 'Resolución', dataKey: 'resolucion' }, { header: 'Observaciones', dataKey: 'observaciones' }];

  const scale: number = 1
  doc.context2d.scale(scale, scale);
  const width = doc.internal.pageSize.width;
  const height = doc.internal.pageSize.height;

  var amountOfPages = 1;
  var page = 1;

  const borderLine = 1 * scale;
  const titleFontSize = (width / 50.333) * scale;
  const paragraphFontSize = (width / 45) * scale;
  const barcodeSize = {
    width: (barcode.width / (4 * (barcode.width / width))) * scale,
    height: (barcode.height / (8 * (barcode.width / width))) * scale,
  };

  //const centerX = width / 2;
  const centerY = height / 2;
  const initialOffSetY = 1;
  let offSetY = 1;
  let x = 0;
  let y = 0;
  let x2 = 0;
  let y2 = 0;

  doc.setLineWidth(borderLine);
  doc.setFontSize(titleFontSize);

  // Margen
  const margin = (width / 6) * scale; // offsetX
  const originX = (width / 20) * scale; // marginX


  const footer = {
    x: width - 3 * originX,
    y: height - originX / 4
  };
  // El orden es importante, no mover esto al hook
  offSetY = drawHeader(doc, originX, margin, offSetY, initialOffSetY, data, barcode, barcodeSize, titleFontSize, paragraphFontSize);
  offSetY = offSetY + initialOffSetY;
  // Doc2 para calcular el nro de paginas 
  autoTable(doc2, {
    body: data.rutas,
    /*
    styles: {
      fontSize: titleFontSize,
    },
    */
    columns: columns,
    startY: doc.getFontSize() * (offSetY + initialOffSetY),
    margin: { top: 60 },
    columnStyles: {
      "codigoDetallePedido": {
        cellWidth: 160,
        minCellHeight: 25,
      }
    },
  });
  var finalYdoc2 = (doc2 as any).lastAutoTable.finalY;
  var limitY = height - originX / 2;
  //offSetY = 1;
  var firmaPosY = finalYdoc2 + originX + doc.getFontSize() * (2 + initialOffSetY);

  const pastLimit = firmaPosY >= limitY;
  amountOfPages = pastLimit ? doc2.getCurrentPageInfo().pageNumber + 1 : doc2.getCurrentPageInfo().pageNumber;
  // Doc2 para calcular el nro de paginas //

  var codDetalle: string | undefined;
  autoTable(doc, {
    body: data.rutas,
    /*
    styles: {
      fontSize: titleFontSize,
    },
    */
    columns: columns,
    startY: doc.getFontSize() * (offSetY + initialOffSetY),
    margin: { top: 60 },
    columnStyles: {
      "codigoDetallePedido": {
        cellWidth: 160,
        minCellHeight: 25,
      }
    },
    willDrawCell: function (HookData) {
      if (HookData.section === 'body' && HookData.column.index === 0 && HookData.column.dataKey === "codigoDetallePedido") {
        codDetalle = HookData.cell.text[0];
        HookData.cell.text = [""]
      }
    },
    didDrawCell: function (HookData) {
      if (HookData.section === 'body' && HookData.column.index === 0 && HookData.column.dataKey === "codigoDetallePedido") {
        if (codDetalle !== undefined) {
          var barcodeCodDetalle = createBarcode(format, codDetalle.padStart(10, '0'));
          doc.addImage(barcodeCodDetalle.dataURL, 'PNG', HookData.cell.x + 2, HookData.cell.y + 2, 140, 20);
        }
      }
    },
    didDrawPage: function (_) {
      page = doc.getCurrentPageInfo().pageNumber;
      if (page !== 1) drawSecundaryHeader(originX, initialOffSetY, margin, data, doc);
      addFooter(doc, page, amountOfPages, footer.x, footer.y);
    }
  })

  let finalY = (doc as any).lastAutoTable.finalY;

  limitY = height - originX / 2;
  offSetY = 1;
  var lineaPosY = finalY + originX + doc.getFontSize() * (offSetY + initialOffSetY)
  offSetY = offSetY + initialOffSetY;
  var firmaPosY = finalY + originX + doc.getFontSize() * (offSetY + initialOffSetY);
  //Footer :
  if (firmaPosY >= limitY) {
    doc.addPage('a4', 'landscape')
    drawSecundaryHeader(originX, initialOffSetY, margin, data, doc);
    page = doc.getCurrentPageInfo().pageNumber;
    addFooter(doc, page, amountOfPages, footer.x, footer.y);
    x = width - 2 * margin;
    y = centerY;
    x2 = width - margin;
    y2 = centerY;
    firmaPosY = centerY + doc.getFontSize();
    addFirma(doc, x, y, x2, y2, firmaPosY, `Firma Conforme`);
  }
  else {
    x = width - 2 * margin;
    y = lineaPosY;
    x2 = width - margin;
    y2 = lineaPosY;
    addFirma(doc, x, y, x2, y2, firmaPosY, `Firma Conforme`);
  }
  const filename = `${data.filename} - ${data.pedidoNro}`;
  doc.save(filename);
};

// Pie de Página
const addFooter = (doc: any, page: number, amountOfPages: number, x: number, y: number) => {
  doc.text(`Página ${page} de ${amountOfPages}`, x, y)
};
// Firma
const addFirma = (doc: any, x: number, y: number, x2: number, y2: number, textoPosY: number, texto: string) => {
  // Linea horizontal
  doc.line(x, y, x2, y2);
  // Texto
  doc.text(texto, x + 20, textoPosY);
};

const drawHeader = (doc: jsPDF, originX: number, marginX: number, offSetY: number, initialOffSetY: number, data: IPDFHojaRutaData, barcode: any, barcodeSize: any,
  titleFontSize: number, paragraphFontSize: number): number => {

  // Hoja de Ruta .Nro
  var y = 0; // cualquier valor
  var x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Hoja de Ruta Nro:`, x, y);
  // Cod. barras
  x = doc.internal.pageSize.width - marginX * 2;
  doc.addImage(barcode.dataURL, 'PNG', x, y - 10, barcodeSize.width, barcodeSize.height);
  // Cod. barras
  x = originX + marginX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const hojaRutaText = data.hojaRutaNro;
  doc.text(hojaRutaText, x, y);
  // Tipo
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Tipo:`, x, y);
  x = originX + marginX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const tipoText = data.tipo;
  doc.text(tipoText, x, y);
  // Pedido Nro°
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Pedido Nro°:`, x, y);
  x = originX + marginX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const pedidoText = data.pedidoNro;
  doc.text(pedidoText, x, y);
  // Usuario que solicita
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Usuario que solicita:`, x, y);
  //  PEDIDO URGENTE
  if (data.fechaPedidoUrgente) {
    doc.setFontSize(paragraphFontSize);
    x = doc.internal.pageSize.width - marginX * 1.8;
    doc.text(`** PEDIDO URGENTE **`, x, y);
    doc.setFontSize(titleFontSize);
  }
  // PEDIDO URGENTE
  x = originX + marginX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const solicitanteText = data.usuarioSolicitante;
  doc.text(solicitanteText, x, y);
  // Enviar a
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Enviar a:`, x, y);
  // FECHA PEDIDO URGENTE
  if (data.fechaPedidoUrgente) {
    x = doc.internal.pageSize.width - marginX * 1.7;
    doc.text(`Fecha de pedido urgente`, x - 1, y);
  }
  // FECHA PEDIDO URGENTE
  x = originX + marginX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const enviarAText = data.enviarA;
  doc.text(enviarAText, x, y);
  // Deposito
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Depósito:`, x, y);
  // Fecha pedido urgente
  if (data.fechaPedidoUrgente) {
    x = doc.internal.pageSize.width - marginX * 1.7;
    doc.text(data.fechaPedidoUrgente, x + 4, y);
  }
  // Fecha pedido urgente
  x = originX + marginX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const depositoText = data.deposito;
  doc.text(depositoText, x, y);
  // Fecha
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Fecha:`, x, y);
  x = originX + marginX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const fechaText = data.fecha;
  doc.text(fechaText, x, y);
  // Descripción del pedido
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Descripción del Pedido:`, x, y);

  x = originX + marginX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const descripcionText = data.descripcion;
  doc.text(descripcionText, x, y);
  return offSetY;
};

const drawSecundaryHeader = (originX: number, initialOffSetY: number, margin: number, data: IPDFHojaRutaData, doc: jsPDF) => {
  var offSetY = 1;
  var x = originX;
  var y: number;
  // Hoja de Ruta .Nro
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Hoja de Ruta Nro:`, x, y);
  x = originX + margin;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const hojaRutaText = data.hojaRutaNro;
  doc.text(hojaRutaText, x, y);
  // Tipo
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Tipo:`, x, y);
  x = originX + margin;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const tipoText = data.tipo;
  doc.text(tipoText, x, y);
  // Pedido Nro°
  offSetY = offSetY + initialOffSetY;
  x = originX;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Pedido Nro°:`, x, y);
  x = originX + margin;
  y = doc.getFontSize() * (offSetY + initialOffSetY);
  const pedidoText = data.pedidoNro;
  doc.text(pedidoText, x, y);
}

export function createCajaPDF(format: string, data: IPDFData, width: number, scale: number = 1) {
  const barcode = createBarcode(format, data.numeroDeCaja.padStart(10, '0'));

  if (width < 400) width = 400;
  else if (width > 1600) width = 1600;
  const doc = new jsPDF('landscape', 'px', [width * scale, (width / 1.777) * scale], true);

  doc.context2d.scale(scale, scale);

  width = doc.internal.pageSize.width;
  const height = doc.internal.pageSize.height;

  const borderLine = 1 * scale;
  const titleFontSize = (width / 33.333) * scale;
  const paragraphFontSize = (width / 45) * scale;
  const barcodeSize = {
    width: (barcode.width / (2.5 * (barcode.width / width))) * scale,
    height: (barcode.height / (2.5 * (barcode.width / width))) * scale,
  };

  const centerX = width / 2;
  const centerY = height / 2;
  const initialOffSetY = 1.5;
  let offSetY = 1;
  let x = 0;
  let y = 0;
  let x2 = 0;
  let y2 = 0;

  doc.setLineWidth(borderLine);
  doc.setFontSize(titleFontSize);

  // Margen
  const margin = (width / 80) * scale;

  // Rectangulo del borde.
  x = margin;
  y = margin;
  x2 = width - margin * 2;
  y2 = height - margin * 2;
  doc.rect(x, y, x2, y2);

  // Linea horizontal
  x = margin;
  y = centerY;
  x2 = width - margin;
  y2 = centerY;
  doc.line(x, y, x2, y2);

  // Linea vertical
  x = centerX;
  y = centerY;
  x2 = centerX;
  y2 = height - margin;
  doc.line(x, y, x2, y2);

  // Destino
  x = centerX - margin / 2;
  y = margin + doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Destino:`, x, y, { align: 'right' });
  x = centerX + margin / 2;
  y = margin + doc.getFontSize() * (offSetY + initialOffSetY);
  const targetText = getTrimmedText(doc, data.destino, titleFontSize, centerX - margin * 4, doc.getFontSize());
  doc.text(targetText, x, y);

  // Sector
  offSetY = 2.5;
  x = centerX - margin / 2;
  y = margin + doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Sector:`, x, y, { align: 'right' });
  x = centerX + margin / 2;
  y = margin + doc.getFontSize() * (offSetY + initialOffSetY);
  const sectorText = getTrimmedText(doc, data.sector, titleFontSize, centerX - margin * 4, doc.getFontSize());
  doc.text(sectorText, x, y);

  // Centro de Costos
  offSetY = 4;
  x = centerX - margin / 2;
  y = margin + doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Centro de Costos:`, x, y, { align: 'right' });
  x = centerX + margin / 2;
  y = margin + doc.getFontSize() * (offSetY + initialOffSetY);
  const costCenterText = getTrimmedText(doc, data.centroDeCostos, titleFontSize, centerX - margin * 4, doc.getFontSize());
  doc.text(costCenterText, x, y);

  // Nro. de Caja
  offSetY = 5.5;
  x = centerX - margin / 2;
  y = margin + doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Nro. de Caja:`, x, y, { align: 'right' });
  x = centerX + margin / 2;
  y = margin + doc.getFontSize() * (offSetY + initialOffSetY);
  const boxNumberText = getTrimmedText(doc, data.numeroDeCaja, titleFontSize, centerX - margin * 4, doc.getFontSize());
  doc.text(boxNumberText, x, y);

  // Descripción
  offSetY = 0;
  x = centerX - centerX / 2;
  y = margin + centerY + doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Descripción`, x, y, {
    align: 'center',
  });
  offSetY = 1.5;
  x = centerX - centerX / 2;
  y = centerY + margin / 2 + doc.getFontSize() * (offSetY + initialOffSetY);
  y2 = height - margin * 2;
  doc.setFontSize(paragraphFontSize);

  const descriptionText = getTrimmedText(doc, data.descripcion, paragraphFontSize, centerX - centerX / 6, y2 - y);

  doc.text(descriptionText, x, y, {
    align: 'center',
    maxWidth: centerX - centerX / 6,
  });

  // Código de barras
  doc.setFontSize(titleFontSize);
  offSetY = 0;
  x = centerX + centerX / 2;
  y = centerY + margin + doc.getFontSize() * (offSetY + initialOffSetY);
  doc.text(`Caja`, x, y, {
    align: 'center',
  });
  offSetY = 1.5;
  x = centerX + centerX / 2 - barcodeSize.width / 2;
  y = margin + centerY + doc.getFontSize() * (offSetY + initialOffSetY) - margin * 2;
  doc.addImage(barcode.dataURL, 'PNG', x, y, barcodeSize.width, barcodeSize.height);

  // Crear archivo
  const filename = `${data.filename} - ${data.numeroDeCaja}`;
  doc.save(filename);
}

const getTrimmedText = (doc: jsPDF, text: string, fontSize: number, maxWidth: number, maxHeight: number) => {
  const blockSize = doc.getTextDimensions(text, {
    fontSize,
    maxWidth,
  });

  const lines: string[] = doc.splitTextToSize(text, blockSize.w);

  const lineHeight = blockSize.h / lines.length;

  const allLines = lines.length;

  const maxLines = maxHeight / lineHeight;

  const hasEllipsis = allLines > maxLines;

  let trimmedText = lines;

  if (hasEllipsis) {
    trimmedText = trimmedText.slice(0, maxLines);
    trimmedText.push('...');
  }

  return trimmedText.join(' ');
};

