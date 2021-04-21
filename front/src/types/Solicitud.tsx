import { IElement } from '.';

export type EstadoSolicitud = 'ENVIADO' | 'DISPONIBLE' | 'INDEXADO' | 'ERROR' | 'RECIBIDO';

export interface Solicitud extends IElement {
  idOperacion: number;
  proceso: string;
  subproceso: string;
  solicitud: number;
  documentoCliente: string;
  nombreCliente: string;
  fecha: string;
  estado: EstadoSolicitud;
  historial: any;
}
