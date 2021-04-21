import JsBarcode from 'jsbarcode';

export interface IBarcode {
  width: number;
  height: number;
  dataURL: string;
}

export function createBarcode(format: string, data: string, mimeType?: string): IBarcode {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, data, { format });

  return { width: canvas.width, height: canvas.height, dataURL: canvas.toDataURL(mimeType) };
}